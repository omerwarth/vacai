import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { cosmosDB } from '../../cosmosdb';

export async function signup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`HTTP function processed request for url "${request.url}"`);
    
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
        const body = await request.json() as any;
        const { email, password, firstName, lastName } = body || {};

        // Basic validation
        if (!email || !password) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:3000',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'Email and password are required' })
            };
        }

        // Check if user already exists
        const existingUsers = await cosmosDB.getItems(`SELECT * FROM c WHERE c.email = "${email}"`);
        
        if (existingUsers.length > 0) {
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
            id: Math.random().toString(36).substring(7),
            email,
            password, // In production, hash this password
            firstName: firstName || '',
            lastName: lastName || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await cosmosDB.createItem(newUser);

        // Don't return password in response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userResponse } = newUser;

        return {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({
                message: 'User created successfully!',
                user: userResponse
            })
        };

    } catch (error) {
        context.log('Signup error:', error);
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ error: 'Failed to create user' })
        };
    }
}

app.http('signup', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: signup
});