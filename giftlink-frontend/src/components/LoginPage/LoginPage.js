import React, { useState, useEffect } from 'react';
import './LoginPage.css';

// Task 1: Import urlConfig from configuration
import { urlConfig } from '../../config';

// Task 2: Import useAppContext from AuthContext
import { useAppContext } from '../../context/AuthContext';

// Task 3: Import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    // Controlled component states for form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Task 4: Include a state for incorrect password validation
    const [incorrect, setIncorrect] = useState('');

    // Task 5: Create local variables for hooks and session tracking
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAppContext();
    const bearerToken = sessionStorage.getItem('auth-token');

    // Task 6: If the bearerToken has a value (user already logged in), redirect to MainPage
    useEffect(() => {
        if (bearerToken) {
            navigate('/app');
        }
    }, [navigate, bearerToken]);

    // Handle asynchronous authentication payload submission
    const handleLogin = async (e) => {
        if (e) e.preventDefault(); // Safely prevent default form submissions if wrapped in a form tag
        setIncorrect('');          // Reset the validation state on a new login attempt

        try {
            // Initiate a POST request to the authentication endpoint
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                method: 'POST', // Task 7
                headers: {      // Task 8
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }) // Task 9
            });

            // Parse incoming data stream into JSON format
            const json = await response.json();

            // Evaluate token presence and process session persistence
            if (json.authtoken) {
                // Set explicit user profile metadata inside the client session cache
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);

                // Update the application wide authentication runtime state
                setIsLoggedIn(true);

                // Navigate to the central workspace view
                navigate('/app');
            } else {
                // Clear out control inputs safely to optimize standard security procedures
                setEmail("");
                setPassword("");

                // Present a localized error message string to the user interface
                setIncorrect("Wrong password. Try again.");

                // Self-destructing layout routine to clear notifications after 2000ms
                setTimeout(() => {
                    setIncorrect("");
                }, 2000);
            }
        } catch (error) {
            console.log("Error fetching details: " + error.message);
            setIncorrect("System error: Unable to contact the authentication layer.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        {/* Task 6 (Subtask): Display inline block validation error to the user */}
                        <span style={{ color: 'red', height: '.5cm', display: 'block', fontStyle: 'italic', fontSize: '12px' }}>
                            {incorrect}
                        </span>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>Login</button>

                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;