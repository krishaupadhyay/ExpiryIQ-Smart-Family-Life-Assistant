import os
import io
import json
import re

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # allows your React frontend (different port/domain) to call this service

# ---- Groq client ----
# Get a free API key from https://console.groq.com
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---- Windows only: point pytesseract to your Tesseract install if needed ----
# Uncomment and adjust the path below if Tesseract isn't found automatically on Windows.
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_image(image_bytes: bytes) -> str:
    """Run Tesseract OCR on the uploaded image and return raw extracted text."""
    image = Image.open(io.BytesIO(image_bytes))
    # Convert to grayscale — usually improves OCR accuracy on packaging/labels
    image = image.convert("L")
    text = pytesseract.image_to_string(image)
    return text


def ask_groq_to_structure_dates(raw_text: str) -> dict:
    """
    Send the raw OCR text to Groq's LLaMA model and ask it to extract
    structured fields: item name, manufacturing date, expiry date.
    This handles messy real-world label formats far better than regex alone.
    """
    prompt = f"""You are extracting structured information from OCR text scanned off a label or document. This could be a medicine strip, grocery packet, or an official document (like a driving license, ID card, or insurance paper).

OCR TEXT:
\"\"\"
{raw_text}
\"\"\"

Extract the following fields if present:
- item_name: the product name, medicine name, or document title/type if identifiable (e.g. "Paracetamol 500mg", "Driving License", "Aadhaar Card")
- mfg_date: the date this item was made or issued. Look for labels like "MFG", "Manufacturing Date", "Issue Date", "Issued On", "Date of Issue". Always in full YYYY-MM-DD format.
- expiry_date: the date this item stops being valid. Look for labels like "EXP", "Expiry", "Best Before", "Use By", "Valid Until", "Valid Till", "Valid Upto", "Renewal Date". Always in full YYYY-MM-DD format.

Rules:
- Treat "Issue Date" the same as a manufacturing date, and "Valid Until"/"Valid Till" the same as an expiry date — documents and product labels use different wording for the same concepts.
- If a field is not found in the text at all, set its value to null.
- If only a month and year is shown (e.g. "08 2027" or "AUG 2027") with no specific day, use "01" as the day — e.g. "08 2027" becomes "2027-08-01".
- Do not guess dates that aren't present in the text at all.
- Extract item_name and the dates independently — a missing item_name does not mean the dates should also be null, and vice versa.
- Respond with ONLY a valid JSON object, no explanation, no markdown formatting.

Example response format:
{{"item_name": "Driving License", "mfg_date": "2020-01-15", "expiry_date": "2030-01-15"}}
"""

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",  # Groq deprecated llama-3.1-8b-instant in June 2026; this is their recommended replacement
        messages=[{"role": "user", "content": prompt}],
        temperature=0,  # deterministic extraction, not creative writing
    )

    raw_reply = response.choices[0].message.content.strip()
    print(f"[debug] finish_reason: {response.choices[0].finish_reason}")
    print(f"[debug] raw model reply: {repr(raw_reply)}")

    # Strip accidental markdown code fences if the model adds them anyway
    raw_reply = re.sub(r"^```json\s*|\s*```$", "", raw_reply, flags=re.MULTILINE).strip()

    try:
        return json.loads(raw_reply)
    except json.JSONDecodeError:
        # Fallback: return raw text so the frontend can still show something
        return {"item_name": None, "mfg_date": None, "expiry_date": None, "raw_model_reply": raw_reply}


@app.route("/health", methods=["GET"])
def health_check():
    """Simple endpoint to confirm the service is running — useful for deployment checks."""
    return jsonify({"status": "ok", "service": "ExpiryIQ OCR microservice"})


@app.route("/api/scan", methods=["POST"])
def scan_image():
    """
    Main endpoint. Expects a multipart/form-data request with an 'image' file field.
    Returns extracted item name, manufacturing date, and expiry date.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send it as form field 'image'."}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    try:
        image_bytes = image_file.read()
        raw_text = extract_text_from_image(image_bytes)
        print("\n===== RAW OCR TEXT =====")
        print(raw_text)
        print("=========================\n")

        if not raw_text.strip():
            return jsonify({
                "error": "Could not read any text from this image. Try a clearer, well-lit photo.",
                "raw_text": ""
            }), 200

        structured = ask_groq_to_structure_dates(raw_text)
        print("===== GROQ STRUCTURED RESULT =====")
        print(structured)
        print("===================================\n")
        structured["raw_text"] = raw_text  # include raw OCR text for debugging/transparency

        return jsonify(structured), 200

    except Exception as e:
        return jsonify({"error": f"Something went wrong while processing the image: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
