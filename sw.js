// Import the Gen 2 Scheduler
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

// Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00...)
exports.checkAndSendNotifications = onSchedule(
    {
        schedule: "0 * * * *",
        timeZone: "America/Denver",
    },
    async (event) => {
        const db = admin.firestore();
        const messaging = admin.messaging();
        const now = new Date();

        // 1. Calculate Target Date: Tomorrow (for "night_before" preference)
        // We only check this if the current hour is 6 PM (18:00)
        const currentHour = now.getHours();
        
        // --- ONLY RUN AT 6 PM ---
        if (currentHour !== 18) {
            console.log("Not 6 PM yet. Skipping.");
            return;
        }

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = getFormattedDate(tomorrow);

        // 2. Fetch Events for tomorrow
        const eventsRef = db.collection("events");
        const snapshot = await eventsRef.where("date", "==", tomorrowStr).get();
        
        let relevantEvents = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // We are only sending "night_before" triggers
            relevantEvents.push({ ...data, trigger: "night_before" });
        });

        if (relevantEvents.length === 0) {
            console.log("No events found for tomorrow.");
            return;
        }

        // 3. Fetch Users (Tokens) who want "night_before" notifications
        // And filter by the specific event types they subscribed to.
        const tokensRef = db.collection("notificationTokens");
        const messages = [];

        // Get all users who want notifications the night before
        const userQuery = await tokensRef.where("timing", "==", "night_before").get();

        if (userQuery.empty) {
            console.log("No users subscribed for night_before notifications.");
            return;
        }

        const users = [];
        userQuery.forEach(doc => users.push(doc.data()));

        // Match events to users
        for (const event of relevantEvents) {
            for (const user of users) {
                // Check if user subscribed to this specific event type (e.g., "Briefing")
                if (user.types && user.types.includes(event.designator)) {
                    const message = {
                        token: user.token,
                        notification: {
                            title: `Upcoming: ${event.name}`,
                            body: `Reminder: ${event.designator} is tomorrow!`,
                        },
                    };
                    messages.push(message);
                }
            }
        }

        // 4. Send All Messages
        if (messages.length > 0) {
            // Batch send if possible, or individual promises
            // sendAll is legacy, using sendEach is recommended for v2, but sendAll works for now
            // We will use Promise.all with individual sends to be safe with newer SDKs
            const promises = messages.map(msg => messaging.send(msg));
            const results = await Promise.allSettled(promises);
            console.log(`Sent ${results.length} notifications.`);
        }
    }
);

// Helper function
function getFormattedDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}