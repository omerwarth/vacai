import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { cosmosDB } from '../cosmosdb';

module.exports = async function (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    console.log(`Http function processed request for url "${request.url}"`);

    try {
        const users = await cosmosDB.getItems();
        
        // Remove passwords from response
        const safeUsers = users.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });
        
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                users: safeUsers,
                count: safeUsers.length
            })
        };
    } catch (error) {
        console.log('Error fetching users:', error);
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to fetch users' })
        };
    }
}