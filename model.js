const fs = require('fs');
const path = require('path');
const db = require('./db');


let files = fs.readdirSync(path.join(__dirname, 'models'));

let js_files = files.filter(f => {
    return f.endsWith('.js');
});


module.exports = {};


for (let f of js_files) {
    console.log(`import model from file ${f}...`);
    let name = f.substring(0, f.length - 3);
    module.exports[name] = require(path.join(__dirname, 'models', f));
}


////////////////////////////////////////////////////////
//////// 下面建立表之间的关联
////////////////////////////////////////////////////////

const {
    Airport,
    City,
    CommonContact,
    Airline,
    Aircraft,
    Flight,
    User,
    PassengerContact,
    Order,
    Ticket
} = module.exports;

const CASCADE = "CASCADE";

/**
 * city
 */
City.hasMany(Airport, {
    onDelete: CASCADE,
    foreignKey: 'cityId',
    constraints: true
});


/**
 * Airport
 */
Airport.hasMany(CommonContact, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'ownerId',
});
Airport.belongsTo(City, {
    onDelete: CASCADE,
    foreignKey: 'cityId',
    constraints: true,
    alias: 'airport',
});

/**
 * Airline
 */
Airline.hasMany(CommonContact, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'ownerId',
});
Airline.hasMany(Aircraft, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'companyId',
});

Aircraft.belongsTo(Airline, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'companyId',
});


/**
 * Flight
 */
Flight.belongsTo(Airline, {
    foreignKey: "companyId",
    as: 'airline',
});
Flight.belongsTo(Aircraft, {
    foreignKey: "aircraftId",
    as: 'aircraft'
});
Flight.belongsTo(Airport, {
    foreignKey: "departAirportId",
    as: 'departAirport'
});
Flight.belongsTo(Airport, {
    foreignKey: "arrivalAirportId",
    as: 'arrivalAirport',
});


/**
 * Order
 */
Order.belongsTo(User, {
    foreignKey: "uid",
    onDelete: CASCADE
});
User.hasMany(Order, {
    foreignKey: "uid",
    onDelete: CASCADE
});

Order.belongsToMany(PassengerContact, {
    through: "Order_Passenger",
    foreignKey: "orderId",
    as: 'passengers',
});

PassengerContact.belongsToMany(Order, {
    through: "Order_Passenger",
    foreignKey: 'passengerContactId',
    as: 'orders'
});

Order.belongsTo(Ticket, {
    onDelete: CASCADE,
    foreignKey: 'ticketId',
});

/**
 * Ticket
 * @param then
 */
Ticket.hasMany(Order, {
    constraints: true,
    foreignKey: 'ticketId',
});



/**
 * Passenger Contact
 */
PassengerContact.belongsTo(User, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: "uid",
});
User.hasMany(PassengerContact, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: "uid",
    as: 'passengerContacts',
});



Ticket.belongsTo(Flight, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'flightId',
});

Flight.hasMany(Ticket, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'flightId',
    as: 'tickets',
});

module.exports.sync = (then) => {
    db.sync(then);
};