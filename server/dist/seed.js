"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("./models/User");
const Category_1 = require("./models/Category");
const Service_1 = require("./models/Service");
const Order_1 = require("./models/Order");
const Appointment_1 = require("./models/Appointment");
const Review_1 = require("./models/Review");
dotenv_1.default.config();
const seedDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tailorconnect';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');
        // Drop database to clear stale indexes and collections
        if (mongoose_1.default.connection.db) {
            await mongoose_1.default.connection.db.dropDatabase();
            console.log('Dropped database for a clean slate.');
        }
        else {
            await User_1.User.deleteMany({});
            await Category_1.Category.deleteMany({});
            await Service_1.Service.deleteMany({});
            await Order_1.Order.deleteMany({});
            await Appointment_1.Appointment.deleteMany({});
            await Review_1.Review.deleteMany({});
            console.log('Cleared existing data.');
        }
        // 1. Create Categories
        const categoriesData = [
            {
                name: 'Bridal Lehengas',
                slug: 'bridal-lehengas',
                description: 'Elite royal custom lehengas and wedding bridal attire, intricately crafted.',
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=400&fit=crop',
            },
            {
                name: 'Designer Blouses',
                slug: 'designer-blouses',
                description: 'Perfect-fit crop tops, backless corsets, and bespoke padded saree blouses.',
                image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&h=400&fit=crop',
            },
            {
                name: 'Sherwanis & Kurtas',
                slug: 'sherwanis',
                description: 'Luxurious groomsmen jackets, hand-embroidered bandhgalas and casual kurtas.',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=400&fit=crop',
            },
            {
                name: "Men's & Women's Suits",
                slug: 'suits',
                description: 'Bespoke corporate blazers, dinner tuxedos and slim-fit trousers.',
                image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=400&fit=crop',
            },
            {
                name: 'Custom Gowns',
                slug: 'custom-gowns',
                description: 'Evening party gowns, red-carpet flowy outfits, and cocktail wear.',
                image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=400&fit=crop',
            },
            {
                name: 'Designer Kurtis',
                slug: 'kurtis',
                description: 'Comfortable cotton casuals, Anarkalis, and ethnic daily styling.',
                image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&h=400&fit=crop',
            },
        ];
        const categories = await Category_1.Category.insertMany(categoriesData);
        console.log('Seeded Categories.');
        // Helper map
        const catMap = categories.reduce((acc, c) => {
            acc[c.slug] = c._id;
            return acc;
        }, {});
        // 2. Hash Passwords
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash('password123', salt);
        // 3. Create Users (Admin, Customer, Tailors)
        const usersData = [
            {
                name: 'Alexander Mercer',
                email: 'admin@suidhaga.com',
                password: passwordHash,
                role: 'admin',
                city: 'Mumbai',
                profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
            },
            {
                name: 'Jane Doe',
                email: 'customer1@gmail.com',
                password: passwordHash,
                role: 'customer',
                city: 'Mumbai',
                profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
                measurements: {
                    upperBody: { chest: 34, shoulder: 15, waist: 28, sleeveLength: 22 },
                    lowerBody: { hip: 38, inseam: 30, outseam: 40, waist: 29 },
                    accents: { neck: 13, wrist: 6, ankle: 9 },
                },
            },
            {
                name: 'Stitch Studio',
                email: 'tailor1@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Mumbai',
                profilePicture: 'https://i.pinimg.com/736x/6d/28/00/6d2800a3674e46f55a1f176529e66dde.jpg',
                bio: 'Bespoke • Bridal • Couture. Handpicked tailors known for their craftsmanship.',
                rating: 4.9,
                numReviews: 1,
                isVerified: true,
            },
            {
                name: "The Tailor's Room",
                email: 'tailor2@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Delhi',
                profilePicture: 'https://i.pinimg.com/736x/41/1a/c5/411ac512bd7302bcccb677d97d3ec5e9.jpg',
                bio: 'Suits • Menswear • Custom. Master corporate suits and heritage tuxedos.',
                rating: 4.8,
                numReviews: 1,
                isVerified: true,
            },
            {
                name: 'Thread & Knot',
                email: 'tailor3@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Bangalore',
                profilePicture: 'https://i.pinimg.com/736x/4b/fd/1f/4bfd1f1ca416a2fe1489c19f832a736a.jpg',
                bio: 'Ethnic • Indo-Western • Custom. Handcrafted traditional craft blending.',
                rating: 4.9,
                numReviews: 0,
                isVerified: true,
            },
            {
                name: 'House of Stitches',
                email: 'tailor4@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Pune',
                profilePicture: 'https://i.pinimg.com/736x/0b/42/ef/0b42efcfc024ac3315c51039c26b199d.jpg',
                bio: 'Alterations • Tailoring • Repairs. Fine wool, cotton and casual finishes.',
                rating: 4.7,
                numReviews: 0,
                isVerified: true,
            },
            {
                name: 'My Fairy Lily Boutique',
                email: 'tailor5@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Mumbai',
                profilePicture: 'https://i.pinimg.com/736x/17/52/49/1752496ae7ec7173355cfd643f304728.jpg',
                bio: 'Whimsical romantic wedding dresses and bridal couture.',
                rating: 4.9,
                numReviews: 0,
                isVerified: true,
            },
            {
                name: 'Walker Slater Tweeds',
                email: 'tailor6@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Bangalore',
                profilePicture: 'https://i.pinimg.com/736x/6c/17/86/6c178620365972d189913792423dd36a.jpg',
                bio: 'Specialists in fine wool tweeds, custom suits, and outerwear.',
                rating: 4.8,
                numReviews: 0,
                isVerified: true,
            },
            {
                name: 'Asmara Heritage Tailors',
                email: 'tailor7@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Mumbai',
                profilePicture: 'https://i.pinimg.com/736x/7d/81/05/7d8105ad8f7942c83d59aae7b5deb016.jpg',
                bio: 'Vintage tailoring patterns and classic custom ethnic wear.',
                rating: 4.9,
                numReviews: 0,
                isVerified: true,
            },
            {
                name: 'The Fabric Atelier',
                email: 'tailor8@gmail.com',
                password: passwordHash,
                role: 'tailor',
                city: 'Delhi',
                profilePicture: 'https://i.pinimg.com/736x/48/25/1e/48251ef29ea90bd36d800324084ff36d.jpg',
                bio: 'Curators of premium fabrics and bespoke apparel cuts.',
                rating: 4.8,
                numReviews: 0,
                isVerified: true,
            },
        ];
        const seededUsers = await User_1.User.insertMany(usersData);
        console.log('Seeded Users.');
        const customer = seededUsers[1];
        const tailor1 = seededUsers[2];
        const tailor2 = seededUsers[3];
        const tailor3 = seededUsers[4];
        const tailor4 = seededUsers[5];
        const tailor5 = seededUsers[6];
        const tailor6 = seededUsers[7];
        const tailor7 = seededUsers[8];
        const tailor8 = seededUsers[9];
        // 4. Create Services
        const servicesData = [
            {
                tailor: tailor1._id,
                category: catMap['bridal-lehengas'],
                name: 'Royal Zardozi Bridal Lehenga',
                description: 'Exquisite hand-embroidered wedding lehenga with personalized borders.',
                price: 2500,
                baseTimeDays: 21,
            },
            {
                tailor: tailor1._id,
                category: catMap['custom-gowns'],
                name: 'Red Carpet Silk Gown',
                description: 'Custom fitted silk evening gown with tail draped accents.',
                price: 1200,
                baseTimeDays: 14,
            },
            {
                tailor: tailor2._id,
                category: catMap['suits'],
                name: 'Classic Three-Piece Italian Suit',
                description: 'Bespoke fit wool blend suit including blazer, vest and flat-front trousers.',
                price: 850,
                baseTimeDays: 10,
            },
            {
                tailor: tailor2._id,
                category: catMap['sherwanis'],
                name: 'Groomsmen Silk Bandhgala Sherwani',
                description: 'Royal closed-neck jacket with premium buttons and churidar pants.',
                price: 1100,
                baseTimeDays: 12,
            },
            {
                tailor: tailor3._id,
                category: catMap['designer-blouses'],
                name: 'Handloom Silk Choli Blouse',
                description: 'Custom neckline padding blouse with embroidered dori ties.',
                price: 150,
                baseTimeDays: 5,
            },
            {
                tailor: tailor3._id,
                category: catMap['kurtis'],
                name: 'Floral Anarkali Suit Stitching',
                description: 'Elegant custom printed flowy kurti stitch including neck piping.',
                price: 200,
                baseTimeDays: 6,
            },
            {
                tailor: tailor4._id,
                category: catMap['suits'],
                name: 'Corporate Woolen Blazer',
                description: 'Perfect corporate business blazer tailored from premium fabrics.',
                price: 450,
                baseTimeDays: 8,
            },
            {
                tailor: tailor5._id,
                category: catMap['custom-gowns'],
                name: 'Romantic Tulle Gown',
                description: 'Whimsical multi-layered tulle gown with corset style backing.',
                price: 950,
                baseTimeDays: 14,
            },
            {
                tailor: tailor6._id,
                category: catMap['suits'],
                name: 'Walker Slater Custom Tweed Suit',
                description: 'Traditional heavy-weight Scottish tweed jacket and matching trousers.',
                price: 1350,
                baseTimeDays: 15,
            },
            {
                tailor: tailor7._id,
                category: catMap['bridal-lehengas'],
                name: 'Heritage Brocade Lehenga',
                description: 'Exquisite banarasi silk brocade lehenga with custom blouse work.',
                price: 1850,
                baseTimeDays: 18,
            },
            {
                tailor: tailor8._id,
                category: catMap['designer-blouses'],
                name: 'Atelier Velvet Crop Blouse',
                description: 'Premium raw velvet padded blouse with customized neckline options.',
                price: 220,
                baseTimeDays: 6,
            },
        ];
        const seededServices = await Service_1.Service.insertMany(servicesData);
        console.log('Seeded Services.');
        // 5. Create Orders
        // Order 1: Active order in progress (Sabyasachi Lehenga)
        const order1 = await Order_1.Order.create({
            customer: customer._id,
            tailor: tailor1._id,
            service: seededServices[0]._id,
            designReferences: [
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop',
            ],
            selectedMeasurements: customer.measurements,
            price: 2500,
            notes: 'Please keep the borders dark gold. Double dupatta styling.',
            status: 'Hand-stitching',
            milestoneTimeline: [
                {
                    status: 'Pending',
                    note: 'Stitching request submitted. Awaiting confirmation.',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                },
                {
                    status: 'Fabric Sourcing',
                    note: 'Acquired premium raw silk and handloom brocades from Banaras.',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                },
                {
                    status: 'Cutting & Preparation',
                    note: 'Panels cut. Initiating lining attachments and initial fitting alignments.',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                },
                {
                    status: 'Hand-stitching',
                    note: 'Artisans now embroidering Zardozi patterns onto the border panels.',
                    timestamp: new Date(),
                    mediaUrl: 'https://images.unsplash.com/photo-1605497746444-0e5d594b8e21?w=500&fit=crop',
                },
            ],
        });
        // Order 2: Delivered order (Raymond Suit)
        const order2 = await Order_1.Order.create({
            customer: customer._id,
            tailor: tailor2._id,
            service: seededServices[2]._id,
            designReferences: [
                'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=500&fit=crop',
            ],
            selectedMeasurements: customer.measurements,
            price: 850,
            notes: 'Requires inside pocket for travel credentials. Notch lapel.',
            status: 'Delivered',
            milestoneTimeline: [
                {
                    status: 'Pending',
                    note: 'Request submitted.',
                    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                },
                {
                    status: 'Fabric Sourcing',
                    note: 'Imported superfine merino wool.',
                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    status: 'Hand-stitching',
                    note: 'Assembling structure.',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                },
                {
                    status: 'Final Pressing',
                    note: 'Ironed, lint rolled, packaged in garment bag.',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                },
                {
                    status: 'Delivered',
                    note: 'Handed over directly to customer at home store.',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                },
            ],
        });
        console.log('Seeded Orders.');
        // 6. Create Reviews
        await Review_1.Review.create({
            order: order2._id,
            customer: customer._id,
            tailor: tailor2._id,
            rating: 5,
            comment: 'Absolutely immaculate fitting! The wool fabric feels luxurious, and the sleeve length matches my specifications perfectly. Master tailoring at its finest.',
        });
        // Seed one for Sabyasachi from a simulated past customer
        const mockUser = await User_1.User.create({
            name: 'Priyanka Chopra',
            email: 'priyanka@gmail.com',
            password: passwordHash,
            role: 'customer',
            city: 'Mumbai',
        });
        const order3 = await Order_1.Order.create({
            customer: mockUser._id,
            tailor: tailor1._id,
            service: seededServices[1]._id,
            selectedMeasurements: customer.measurements,
            price: 1200,
            status: 'Delivered',
        });
        await Review_1.Review.create({
            order: order3._id,
            customer: mockUser._id,
            tailor: tailor1._id,
            rating: 5,
            comment: 'An absolute masterpiece of a gown! Sabyasachi is simply the best couture designer on the planet.',
        });
        console.log('Seeded Reviews.');
        // 7. Create Appointments
        await Appointment_1.Appointment.create({
            customer: customer._id,
            tailor: tailor1._id,
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            timeSlot: '11:00 AM - 12:00 PM',
            notes: 'Initial fitting consult for a custom sherwani.',
            status: 'Pending',
        });
        await Appointment_1.Appointment.create({
            customer: customer._id,
            tailor: tailor2._id,
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            timeSlot: '04:00 PM - 05:00 PM',
            notes: 'Suit measurement consultation.',
            status: 'Approved',
        });
        console.log('Seeded Appointments.');
        console.log('Seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
seedDB();
