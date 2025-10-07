import { getStorage, getPricingService, getPiNetworkService, getEmailService } from "./_utils";
async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { action, data } = request.body;
    const storage = await getStorage();
    const pricingService = await getPricingService();
    const piNetworkService = await getPiNetworkService();
    const sendPurchaseConfirmationEmail = await getEmailService();
    switch (action) {
      case "approve":
        const { paymentId } = data;
        if (!paymentId) {
          return response.status(400).json({ message: "Payment ID required" });
        }
        const payment = await piNetworkService.getPayment(paymentId);
        if (!payment) {
          return response.status(404).json({ message: "Payment not found" });
        }
        if (!payment.metadata?.type || payment.metadata.type !== "backend") {
          return response.status(400).json({ message: "Invalid payment metadata" });
        }
        let transaction = await storage.getTransactionByPaymentId(paymentId);
        if (!transaction) {
          const currentPiPrice = await pricingService.getCurrentPiPrice();
          const usdAmount = pricingService.calculateUsdAmount(payment.amount);
          const transactionData = {
            userId: payment.metadata.userId,
            packageId: payment.metadata.packageId,
            paymentId: payment.identifier,
            piAmount: payment.amount.toString(),
            usdAmount: usdAmount.toString(),
            piPriceAtTime: currentPiPrice.toString(),
            status: "pending",
            gameAccount: payment.metadata.gameAccount,
            metadata: payment.metadata
          };
          transaction = await storage.createTransaction(transactionData);
        }
        const approved = await piNetworkService.approvePayment(paymentId);
        if (!approved) {
          await storage.updateTransaction(transaction.id, { status: "failed" });
          return response.status(500).json({ message: "Payment approval failed" });
        }
        await storage.updateTransaction(transaction.id, { status: "approved" });
        return response.status(200).json({ success: true, transactionId: transaction.id });
      case "complete":
        const { paymentId: completePaymentId, txid } = data;
        if (!completePaymentId || !txid) {
          return response.status(400).json({ message: "Payment ID and txid required" });
        }
        const completeTransaction = await storage.getTransactionByPaymentId(completePaymentId);
        if (!completeTransaction) {
          return response.status(404).json({ message: "Transaction not found" });
        }
        const completed = await piNetworkService.completePayment(completePaymentId, txid);
        if (!completed) {
          await storage.updateTransaction(completeTransaction.id, { status: "failed" });
          return response.status(500).json({ message: "Payment completion failed" });
        }
        await storage.updateTransaction(completeTransaction.id, {
          status: "completed",
          txid
        });
        try {
          const user = await storage.getUser(completeTransaction.userId);
          const pkg = await storage.getPackage(completeTransaction.packageId);
          if (user && pkg && user.email) {
            const gameAccountString = completeTransaction.gameAccount.ign ? `${completeTransaction.gameAccount.ign} (${completeTransaction.gameAccount.uid})` : `${completeTransaction.gameAccount.userId}:${completeTransaction.gameAccount.zoneId}`;
            const emailSent = await sendPurchaseConfirmationEmail({
              to: user.email,
              username: user.username,
              packageName: pkg.name,
              piAmount: completeTransaction.piAmount,
              usdAmount: completeTransaction.usdAmount,
              gameAccount: gameAccountString,
              transactionId: completeTransaction.id,
              paymentId: completePaymentId,
              isTestnet: true
              // Always testnet
            });
            await storage.updateTransaction(completeTransaction.id, { emailSent });
          }
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
        return response.status(200).json({ success: true, transactionId: completeTransaction.id, txid });
      default:
        return response.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Payment operation error:", error);
    return response.status(500).json({ message: "Payment operation failed" });
  }
}
export {
  handler as default
};
