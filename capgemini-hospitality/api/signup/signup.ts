import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { cosmosDB } from '../cosmosdb';

module.exports = async function (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    console.log(`Http function processed request for url "${request.url}"`);
    
    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
        return {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credentials': 'true'
            }
        };
    }

    try {
        const body = await request.json();
        const { email, password, firstName, lastName } = body as any;

        // Basic validation
        if (!email || !password || !firstName || !lastName) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:3000',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'All fields are required' })
            };
        }

        if (password.length < 6) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:3000',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'Password must be at least 6 characters' })
            };
        }

        // Check if user already exists
        const existingUser = await cosmosDB.getItems(`SELECT * FROM c WHERE c.email = "${email}"`);
        if (existingUser.length > 0) {
            return {
                status: 409,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:3000',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'User with this email already exists' })
            };
        }

        // Create new user
        const newUser = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email,
            firstName,
            lastName,
            password, // In production, this should be hashed
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const result = await cosmosDB.createItem(newUser);

        // Don't return password in response
        const { password: _, ...userResponse } = result;

        return {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({
                message: 'Account created successfully!',
                user: userResponse
            })
        };

    } catch (error) {
        console.log('Signup error:', error);
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ error: 'Failed to create account' })
        };
    }
}