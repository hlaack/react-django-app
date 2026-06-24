import { useState } from "react";

function getCookie(name: string): string | null {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the page from reloading
        
        const csrfToken = getCookie('csrftoken');

        try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || '', // Attach the token here
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            console.log("Login successful!");
            // Handle redirect or state update here
        } else {
            console.error("Login failed.");
        }
        } catch (error) {
        console.error("Network error during login", error);
        }
    };

    return (
        <form onSubmit={handleLogin}>
        <h2>Sign In</h2>
        <div>
            <label>Username: </label>
            <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            />
        </div>
        <div>
            <label>Password: </label>
            <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            />
        </div>
        <button type="submit">Login</button>
        </form>
    );
}
