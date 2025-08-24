export async function onRequest(context) {
    const { request, env } = context;
    try {
        const payload = await request.json();
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.XAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('xAI API Error:', errorData);
            return new Response(JSON.stringify({
                error: errorData.error?.message || `API request failed with status: ${response.status}`
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Function Error:', error.message);
        return new Response(JSON.stringify({
            error: 'Proxy request failed: ' + error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
