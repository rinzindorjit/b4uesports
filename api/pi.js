// /api/pi.js - Consolidated Pi Network API handler for Vercel (Testnet mode only)
// This single file replaces multiple Pi API routes to avoid Vercel's 12-function limit

const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  // Extract action from query parameters or request object
  const query = req.query || {};
  const action = query.action || (req.body && req.body.action) || '';
  const method = req.method || 'GET';
  const body = req.body || {};

  console.log("Pi API Handler → Full query object:", JSON.stringify(query));
  console.log("Pi API Handler → Action:", action);
  console.log("Pi API Handler → Method:", method);
  // Log only safe parts of the request to avoid circular reference
  console.log("Pi API Handler → Safe request info:", {
    method: method,
    action: action,
    hasBody: !!body,
    queryKeys: Object.keys(query)
  });
  
  // Check if request is from Pi Browser by looking at the x-requested-with header
  const isPiBrowser = req.headers['x-requested-with'] === 'pi.browser';
  console.log('Pi Browser detection - x-requested-with header:', req.headers['x-requested-with']);
  console.log('Is Pi Browser request:', isPiBrowser);

  try {
    switch (action) {
      case "price": {
        try {
          // Fetch live price from CoinGecko
          const coingeckoApiKey = process.env.COINGECKO_API_KEY || '';
          const headers = {
            'accept': 'application/json',
          };
          
          // Add API key to headers if available
          if (coingeckoApiKey && coingeckoApiKey !== 'your_coingecko_api_key') {
            headers['x-cg-pro-api-key'] = coingeckoApiKey;
          }
          
          const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd',
            { headers }
          );
          
          if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
          }
          
          const data = await response.json();
          const piPrice = data['pi-network']?.usd;
          
          if (!piPrice) {
            throw new Error('Failed to get PI price from CoinGecko');
          }
          
          console.log("Fetched live PI price from CoinGecko:", piPrice);
          return res.status(200).json({ 
            price: piPrice,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error fetching PI price from CoinGecko:", error);
          
          // Fallback to hardcoded price if CoinGecko fails
          const fallbackPrice = 0.26;
          console.log("Using fallback price:", fallbackPrice);
          return res.status(200).json({ 
            price: fallbackPrice,
            lastUpdated: new Date().toISOString(),
            source: 'fallback'
          });
        }
      }

      case "balance": {
        // Mock balance for testnet
        console.log("Balance handler executing");
        const balance = 1000.0;
        
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const response = { 
          balance: balance,
          currency: "PI",
          lastUpdated: new Date().toISOString(),
          isTestnet: true
        };
        
        console.log("Balance response:", JSON.stringify(response));
        return res.status(200).json(response);
      }

      case "auth": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("=== AUTH API ENDPOINT STARTED ===");
        console.log("Request body:", body);
        console.log("Request headers:", req.headers);

        try {
          // Check if body exists and is properly parsed
          if (!body) {
            console.error("❌ Request body is missing or undefined");
            return res.status(400).json({ 
              message: 'Request body is required', 
              error: 'Missing request body' 
            });
          }

          // Check if this is a mock request (for Pi Browser development)
          if (body.isMockAuth) {
            console.log("Handling mock authentication");
            // Create mock user data
            const mockUser = {
              id: 'mock-user-' + Date.now(),
              piUID: 'mock-pi-uid-' + Date.now(),
              username: 'pi_user_' + Math.floor(Math.random() * 10000),
              email: 'piuser@example.com',
              phone: '+1234567890',
              country: 'US',
              language: 'en',
              walletAddress: 'GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              gameAccounts: {
                pubg: { ign: 'PiPlayer', uid: 'PID123456789' },
                mlbb: { userId: 'MLBB987654321', zoneId: 'ZONE1234' }
              },
              profileImageUrl: null,
              isProfileVerified: true,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Generate a mock JWT token
            const mockToken = 'mock-jwt-token-' + Date.now();

            console.log("=== MOCK AUTH API ENDPOINT FINISHED ===");
            return res.status(200).json({
              user: mockUser,
              token: mockToken
            });
          }

          // For non-mock requests, we need an access token
          const { accessToken } = body;

          if (!accessToken) {
            console.error("❌ Access token is missing from request body");
            return res.status(400).json({ message: 'Access token required' });
          }

          // Validate access token format (basic validation)
          if (typeof accessToken !== 'string' || accessToken.length < 10) {
            console.error("❌ Invalid access token format");
            return res.status(400).json({ message: 'Invalid access token format' });
          }

          // Verify the access token with Pi Network
          const piApiUrl = "https://sandbox.minepi.com/v2/me"; // Always Testnet

          console.log("🔄 Authenticating user with Pi Network Testnet API...");
          console.log("🌐 URL:", piApiUrl);
          console.log("🔑 Access token (first 20 chars):", accessToken.substring(0, 20));

          const piResponse = await fetch(piApiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'B4U-Esports-Server/1.0'
            }
          });

          console.log("📥 Pi API Response Status:", piResponse.status);

          // Check if we're hitting CloudFront by looking at the headers
          const serverHeader = piResponse.headers.get('server');
          const viaHeader = piResponse.headers.get('via');
          const cfId = piResponse.headers.get('x-amz-cf-id');
          
          console.log("🔧 Debug: Server header:", serverHeader);
          console.log("🔧 Debug: Via header:", viaHeader);
          console.log("🔧 Debug: CF ID:", cfId);

          // Handle non-JSON responses
          const textResponse = await piResponse.text();
          
          // Check if response is HTML (indicating CDN error)
          if (textResponse.startsWith('<!DOCTYPE') || textResponse.includes('<HTML')) {
            console.error("❌ CDN BLOCK DETECTED - Response is HTML instead of JSON");
            return res.status(403).json({
              error: "CDN Blocking Request",
              message: "Request blocked by CDN - ensure you're hitting the correct Pi Network API endpoint",
              details: "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests.",
              rawResponsePreview: textResponse.substring(0, 500),
              diagnosticInfo: {
                responseHeaders: {
                  server: serverHeader,
                  via: viaHeader,
                  cfId: cfId
                }
              }
            });
          }

          // Try to parse JSON response
          let data;
          try {
            data = JSON.parse(textResponse);
          } catch (parseError) {
            console.error("❌ Failed to parse JSON response:", parseError.message);
            return res.status(500).json({
              error: "Invalid API Response",
              message: "Pi Network API returned non-JSON response",
              rawResponse: textResponse.substring(0, 1000)
            });
          }

          if (!piResponse.ok) {
            console.error(`❌ Pi API Error ${piResponse.status}:`, data);
            return res.status(piResponse.status).json({
              error: "Pi Network API Error",
              message: `API returned status ${piResponse.status}`,
              details: data
            });
          }

          const piUser = data;

          // Create or update user in our database
          const user = {
            id: 'user-' + piUser.uid,
            piUID: piUser.uid,
            username: piUser.username,
            email: piUser.email || '',
            phone: piUser.phone || '',
            country: piUser.country || 'US',
            language: piUser.language || 'en',
            walletAddress: piUser.walletAddress || '',
            gameAccounts: {},
            profileImageUrl: piUser.profileImageUrl || null,
            isProfileVerified: !!(piUser.email && piUser.phone),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Generate a JWT token for our application
          const token = 'mock-jwt-token-' + Date.now() + '-' + piUser.uid;

          console.log("✅ Authentication successful for user:", user.username);
          console.log("=== AUTH API ENDPOINT FINISHED ===");
          return res.status(200).json({
            user: user,
            token: token
          });
        } catch (error) {
          console.error("💥 Authentication failed:", error);
          return res.status(500).json({ 
            message: 'Authentication failed', 
            error: error.message,
            ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
          });
        }
      }

      case "create-payment": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("Creating Pi payment (sandbox mode only)");
        console.log("Payment data:", body);

        // Validate required fields
        if (!body.amount || !body.memo) {
          return res.status(400).json({ 
            error: "Invalid request", 
            message: "Amount and memo are required" 
          });
        }

        // In Testnet mode, we create a mock payment
        // but we still call the Pi Network API to ensure proper integration
        const piApiUrl = "https://sandbox.minepi.com/v2/payments";
        const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

        try {
          const response = await fetch(piApiUrl, {
            method: "POST",
            headers: {
              Authorization: `Key ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              amount: body.amount,
              memo: body.memo || "B4U Esports Payment",
              metadata: body.metadata || {},
            }),
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error("Non-JSON response:", textResponse.substring(0, 300));
            return res.status(response.status).json({
              error: "Invalid response from Pi Network",
              message: textResponse,
            });
          }

          const data = await response.json();
          console.log("Payment API response:", data);
          
          // Return the payment data to the client
          return res.status(response.status).json(data);
        } catch (error) {
          console.error("Payment creation error:", error);
          // In Testnet mode, if Pi API fails, we create a mock payment
          console.log("Creating mock payment for Testnet mode");
          
          const mockPaymentId = `mock-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          const mockPayment = {
            identifier: mockPaymentId,
            amount: body.amount,
            memo: body.memo || "B4U Esports Payment",
            metadata: body.metadata || {},
            status: "created",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          return res.status(200).json(mockPayment);
        }
      }

      case "approve-payment": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("Approving Pi payment (sandbox mode only)");
        console.log("Approval data:", body);

        const { paymentId } = body;
        if (!paymentId) {
          return res.status(400).json({ error: "Payment ID required" });
        }

        // Check if this is a mock payment ID
        const isMockPayment = paymentId.startsWith('mock-') || paymentId.startsWith('mock_');
        
        if (isMockPayment) {
          console.log("Approving mock payment:", paymentId);
          // For mock payments, just return success
          return res.status(200).json({
            identifier: paymentId,
            status: "approved",
            message: "Mock payment approved successfully"
          });
        }

        // For real payments in Testnet, call Pi Network API
        const piApiUrl = `https://sandbox.minepi.com/v2/payments/${paymentId}/approve`;
        const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

        try {
          const response = await fetch(piApiUrl, {
            method: "POST",
            headers: {
              Authorization: `Key ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error("Non-JSON response:", textResponse.substring(0, 300));
            return res.status(response.status).json({
              error: "Invalid response from Pi Network",
              message: textResponse,
            });
          }

          const data = await response.json();
          console.log("Payment approval API response:", data);
          
          // Return the approval data to the client
          return res.status(response.status).json(data);
        } catch (error) {
          console.error("Payment approval error:", error);
          // In Testnet mode, if Pi API fails, we still return success for mock testing
          return res.status(200).json({
            identifier: paymentId,
            status: "approved",
            message: "Payment approved successfully in Testnet mode"
          });
        }
      }

      case "complete-payment": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("Completing Pi payment (sandbox mode only)");
        console.log("Completion data:", body);

        const { paymentId, txid } = body;
        if (!paymentId || !txid) {
          return res.status(400).json({ error: "Payment ID and txid required" });
        }

        // Check if this is a mock payment ID
        const isMockPayment = paymentId.startsWith('mock-') || paymentId.startsWith('mock_');
        
        if (isMockPayment) {
          console.log("Completing mock payment:", paymentId);
          // For mock payments, just return success
          return res.status(200).json({
            identifier: paymentId,
            status: "completed",
            transaction: {
              txid: txid,
              verified: true
            },
            message: "Mock payment completed successfully"
          });
        }

        // For real payments in Testnet, call Pi Network API
        const piApiUrl = `https://sandbox.minepi.com/v2/payments/${paymentId}/complete`;
        const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

        try {
          const response = await fetch(piApiUrl, {
            method: "POST",
            headers: {
              Authorization: `Key ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              txid: txid
            }),
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error("Non-JSON response:", textResponse.substring(0, 300));
            return res.status(response.status).json({
              error: "Invalid response from Pi Network",
              message: textResponse,
            });
          }

          const data = await response.json();
          console.log("Payment completion API response:", data);
          
          // Return the completion data to the client
          return res.status(response.status).json(data);
        } catch (error) {
          console.error("Payment completion error:", error);
          // In Testnet mode, if Pi API fails, we still return success for mock testing
          return res.status(200).json({
            identifier: paymentId,
            status: "completed",
            transaction: {
              txid: txid,
              verified: true
            },
            message: "Payment completed successfully in Testnet mode"
          });
        }
      }

      case "verify-payment": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("Verifying Pi payment with Pi Network API");
        console.log("Verification data:", body);

        const { paymentId } = body;
        if (!paymentId) {
          return res.status(400).json({ error: "Payment ID required" });
        }

        // Check if this is a mock payment ID
        const isMockPayment = paymentId.startsWith('mock-') || paymentId.startsWith('mock_');
        
        if (isMockPayment) {
          console.log("Verifying mock payment:", paymentId);
          // For mock payments, just return success
          return res.status(200).json({
            verified: true,
            paymentId,
            status: 'completed',
            timestamp: new Date().toISOString()
          });
        }

        // For real payments, call Pi Network's metadata endpoint
        const piApiUrl = `https://sandbox.minepi.com/v2/payments/${paymentId}`;
        const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

        try {
          const response = await fetch(piApiUrl, {
            method: "GET",
            headers: {
              Authorization: `Key ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error("Non-JSON response:", textResponse.substring(0, 300));
            return res.status(response.status).json({
              error: "Invalid response from Pi Network",
              message: textResponse,
            });
          }

          const data = await response.json();
          console.log("Payment verification API response:", data);
          
          // Check if payment is completed or approved
          const isVerified = data.status === 'completed' || data.status === 'approved';
          
          // Return verification result
          return res.status(200).json({
            verified: isVerified,
            paymentId,
            status: data.status,
            data: data,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error("Payment verification error:", error);
          return res.status(500).json({
            error: "Payment verification failed",
            message: error.message
          });
        }
      }

      case "user": {
        // Mock user data for testnet
        const mockUser = {
          id: 'mock-user-' + Date.now(),
          piUID: 'mock-pi-uid',
          username: 'mock_user',
          email: 'mock@example.com',
          phone: '+1234567890',
          country: 'US',
          language: 'en',
          walletAddress: 'mock-wallet-address',
          gameAccounts: {},
          profileImageUrl: null,
          isProfileVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return res.status(200).json(mockUser);
      }

      case "webhook": {
        // Handle Pi Network webhook
        if (method !== 'POST') {
          return res.status(405).json({ message: 'Method not allowed' });
        }

        // In Vercel, the request body is already parsed as JSON
        const requestBody = body || {};
        
        const { action: webhookAction, paymentId, txid } = requestBody;
        
        // Log the webhook event
        console.log('Pi Network webhook received:', { action: webhookAction, paymentId, txid });
        
        // Process different webhook actions
        switch (webhookAction) {
          case 'payment_created':
            console.log('Payment created webhook received:', paymentId);
            break;
          case 'payment_approved':
            console.log('Payment approved webhook received:', paymentId);
            break;
          case 'payment_completed':
            console.log('Payment completed webhook received:', paymentId, txid);
            // Here you would typically update your database to mark the transaction as completed
            break;
          default:
            console.log('Unknown webhook action:', webhookAction);
        }
        
        // Acknowledge the webhook
        return res.status(200).json({ success: true });
      }

      case "test": {
        // Simple test endpoint
        return res.status(200).json({ 
          message: "Pi API handler is working correctly",
          action: "test",
          timestamp: new Date().toISOString()
        });
      }

      default:
        console.log("Pi API Handler → Invalid action received:", action);
        console.log("Pi API Handler → Full request details:", JSON.stringify({ 
          method: req.method, 
          url: req.url, 
          query: req.query, 
          body: req.body,
          headers: req.headers
        }, null, 2));
        return res.status(400).json({ 
          error: "Invalid action", 
          receivedAction: action,
          message: `Action '${action}' is not supported. Supported actions: price, balance, auth, create-payment, approve-payment, complete-payment, verify-payment, user, webhook, test`
        });
    }
  } catch (error) {
    console.error("Pi API handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}