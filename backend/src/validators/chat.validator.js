/**
 * Valide le message du chatbot
 */
export const validateMessage = (req, res, next) => {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({ error: "Message invalide" });
    }

    next();
};
