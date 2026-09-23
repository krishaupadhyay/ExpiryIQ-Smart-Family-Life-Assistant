import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

export default function Logout() {

    const navigate = useNavigate();

    useEffect(() => {

        async function logoutUser() {

            try {

                await apiRequest('/auth/logout', {
                    method: 'POST'
                });

            } catch (error) {

                console.error('Logout error:', error);

            } finally {

                navigate('/login', {
                    replace: true
                });
            }
        }

        logoutUser();

    }, [navigate]);


    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFDF7'
            }}
        >
            <div
                style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    boxShadow:
                        '0 4px 24px rgba(15,26,46,0.08)'
                }}
            >
                <h1
                    style={{
                        color: '#0F1A2E',
                        fontSize: '24px',
                        marginBottom: '10px'
                    }}
                >
                    Signing you out...
                </h1>

                <p style={{ color: '#6B7280' }}>
                    Please wait...
                </p>
            </div>
        </div>
    );
}