import cappuccinoImg from "@/assets/food-cappuccino.jpg";
import latteImg from "@/assets/food-latte.jpg";
import coldbrewImg from "@/assets/food-coldbrew.jpg";
import chaiImg from "@/assets/food-chai.jpg";
import sandwichImg from "@/assets/food-sandwich.jpg";
import brownieImg from "@/assets/food-brownie.jpg";
import muffinImg from "@/assets/food-muffin.jpg";
import pastaImg from "@/assets/food-pasta.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "beverage" | "snack";
}

export const menuItems: MenuItem[] = [
  {
    id: "cappuccino",
    name: "Classic Cappuccino",
    description: "Rich espresso topped with velvety steamed milk and a thick layer of foam. A timeless Italian classic.",
    price: 180,
    image: cappuccinoImg,
    category: "beverage",
  },
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    description: "Smooth espresso blended with creamy steamed milk and sweet caramel syrup, topped with whipped cream.",
    price: 220,
    image: latteImg,
    category: "beverage",
  },
  {
    id: "cold-brew",
    name: "Cold Brew Coffee",
    description: "Slow-steeped for 20 hours, our cold brew is smooth, bold, and naturally sweet. Served over ice.",
    price: 200,
    image: coldbrewImg,
    category: "beverage",
  },
  {
    id: "masala-chai",
    name: "Masala Chai",
    description: "Traditional Indian spiced tea with cardamom, cinnamon, ginger and cloves. Brewed with fresh milk.",
    price: 100,
    image: chaiImg,
    category: "beverage",
  },
  {
    id: "chicken-sandwich",
    name: "Grilled Chicken Sandwich",
    description: "Juicy grilled chicken breast with fresh lettuce, tomatoes, and our house-made herb mayo on artisan bread.",
    price: 280,
    image: sandwichImg,
    category: "snack",
  },
  {
    id: "chocolate-brownie",
    name: "Chocolate Brownie",
    description: "Dense, fudgy chocolate brownie made with premium cocoa. Drizzled with chocolate sauce.",
    price: 150,
    image: brownieImg,
    category: "snack",
  },
  {
    id: "blueberry-muffin",
    name: "Blueberry Muffin",
    description: "Fluffy, golden muffin bursting with fresh blueberries. Perfectly baked with a crispy top.",
    price: 140,
    image: muffinImg,
    category: "snack",
  },
  {
    id: "creamy-pasta",
    name: "Creamy Herb Pasta",
    description: "Al dente pasta tossed in a rich, creamy parmesan sauce with fresh herbs and cracked black pepper.",
    price: 320,
    image: pastaImg,
    category: "snack",
  },
];
