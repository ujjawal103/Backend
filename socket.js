const { Server } = require("socket.io");
const adminModel = require("./models/admin.model");
const storeModel = require("./models/restronStore.model");

let io = null;



function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        
        
        socket.on("join", async (data) => {
            const { userId , userType } = data;
            console.log(`Join request from userType: ${userType}, userId: ${userId}`);
            
            if (userType === "admin") {
                const admin = await adminModel.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true });
                if (admin) {     
                     console.log(`User ${admin.fullName?.firstName} joined with socket ID: ${socket.id}`);
                }
            }
            if (userType === "store") {
                const store = await storeModel.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true });
                if (store) {
                     console.log(`Store ${store.storeName} joined with socket ID: ${socket.id}`);
                }
            }
        });



        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}



function sendMessageToSocket( socketId , messageobj) {
    
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    if (socketId) {
        io.to(socketId).emit(messageobj.event, messageobj.data); // send to specific socket
        // console.log(`Message sent to socket ${socketId}:`, messageobj);
    }
}



module.exports = {
    initializeSocket,
    sendMessageToSocket
};