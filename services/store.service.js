const storeModel = require('../models/restronStore.model');
// const barberModel = require('../models/barber.model');

const createStore = async ({ storeName, email, password , photo , address , phoneNumber , gstApplicable , gstRate, restaurantChargeApplicable ,restaurantCharge }) => {
     if(!storeName || !email || !password || !address) {
        throw new Error("All fields are required");
    }
    try {
        const newStore = new storeModel({
            storeName,
            email,
            password,
            storeDetails: {
                photo,
                address,
                phoneNumber
            },
            gstSettings : {
                gstApplicable,
                gstRate,
                restaurantChargeApplicable,
                restaurantCharge
            },
            status : "open"
        });
        await newStore.save();
        return newStore;
    } catch (error) {
        throw error;
    }
};

module.exports = {createStore};


// module.exports.addBarber = async (storeId, { name, experience , pricePerSlot }) => {
//     if (!name || !experience || !pricePerSlot) {
//         throw new Error("All fields are required");
//     }

//     try {
//         const barber = new barberModel({
//             name,
//             experience,
//             store: storeId,
//             pricePerSlot
//         });
//         await barber.save();

//         await barberStoreModel.findByIdAndUpdate(storeId, { $push: { barbers: barber._id } });

//         return barber;
//     } catch (error) {
//         throw error;
//     }
// };
