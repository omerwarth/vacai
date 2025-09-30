import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { cosmosDB } from '../../cosmosdb';

export async function signin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`HTTP function processed request for url "${request.url}"`);
    
    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
        context.log('Handling OPTIONS request');
        return {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credentials': 'true'
            }
        };
    }

    try {
        context.log('Processing POST request');
        const body = await request.json() as any;
        const { email, password } = body || {};

        // Basic validation
        if (!email || !password) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'Email and password are required' })
            };
        }

        // Find user by email
        const users = await cosmosDB.getItems(`SELECT * FROM c WHERE c.email = "${email}"`);
        
        if (users.length === 0) {
            return {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'Invalid email or password' })
            };
        }

        const user = users[0];

        // Check password (in production, compare with hashed password)
        if (user.password !== password) {
            return {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'Invalid email or password' })
            };
        }

        // Update last login time
        const updatedUser = {
            ...user,
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await cosmosDB.updateItem(user.id as string, updatedUser);

        // Don't return password in response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userResponse } = user;

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({
                message: 'Signed in successfully!',
                user: userResponse
            })
        };

    } catch (error) {
        context.log('Signin error:', error);
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ error: 'Failed to sign in' })
        };
    }
}

app.http('signin', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: signin
});