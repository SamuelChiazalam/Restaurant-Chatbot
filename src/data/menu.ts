export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export const menu: MenuItem[] = [
  // Nigerian Classics
  { id: 1, name: "Jollof Rice", price: 1500 },
  { id: 2, name: "Fried Rice", price: 1500 },
  { id: 3, name: "Coconut Rice", price: 1800 },
  { id: 4, name: "Ofada Rice & Stew", price: 2000 },

  // Proteins
  { id: 5, name: "Grilled Chicken", price: 2500 },
  { id: 6, name: "Fried Chicken", price: 2200 },
  { id: 7, name: "Beef Stew", price: 2000 },
  { id: 8, name: "Fish (Tilapia)", price: 3000 },
  { id: 9, name: "Goat Meat", price: 2800 },

  // International
  { id: 10, name: "Cheeseburger", price: 2500 },
  { id: 11, name: "Chicken Burger", price: 2300 },
  { id: 12, name: "Margherita Pizza", price: 3500 },
  { id: 13, name: "Pepperoni Pizza", price: 4000 },
  { id: 14, name: "Spaghetti Bolognese", price: 2000 },

  // Drinks
  { id: 15, name: "Coca Cola", price: 400 },
  { id: 16, name: "Sprite", price: 400 },
  { id: 17, name: "Fanta", price: 400 },
  { id: 18, name: "Bottled Water", price: 200 },
  { id: 19, name: "Chapman", price: 800 },

  // Sides
  { id: 20, name: "Plantain", price: 600 },
  { id: 21, name: "Moi Moi", price: 500 },
  { id: 22, name: "Coleslaw", price: 400 },
  { id: 23, name: "French Fries", price: 800 },
];
