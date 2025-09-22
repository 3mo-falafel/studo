import { Product } from "@/types/product";
const shopData: Product[] = [
  {
    title: "Havit HV-G69 USB Gamepad",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 1,
    categorySlug: "computer-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-1-sm-1.png",
        "/images/products/product-1-sm-2.png",
      ],
      previews: [
        "/images/products/product-1-bg-1.png",
        "/images/products/product-1-bg-2.png",
      ],
    },
  },
  {
    title: "iPhone 14 Plus , 6/128GB",
    reviews: 5,
    price: 899.0,
    discountedPrice: 99.0,
    id: 2,
    categorySlug: "phone-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-2-sm-1.png",
        "/images/products/product-2-sm-2.png",
      ],
      previews: [
        "/images/products/product-2-bg-1.png",
        "/images/products/product-2-bg-2.png",
      ],
    },
  },
  {
    title: "Apple iMac M1 24-inch 2021",
    reviews: 5,
    price: 59.0,
    discountedPrice: 29.0,
    id: 3,
    categorySlug: "computer-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-3-sm-1.png",
        "/images/products/product-3-sm-2.png",
      ],
      previews: [
        "/images/products/product-3-bg-1.png",
        "/images/products/product-3-bg-2.png",
      ],
    },
  },
  {
    title: "MacBook Air M1 chip, 8/256GB",
    reviews: 6,
    price: 59.0,
    discountedPrice: 29.0,
    id: 4,
    categorySlug: "computer-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-4-sm-1.png",
        "/images/products/product-4-sm-2.png",
      ],
      previews: [
        "/images/products/product-4-bg-1.png",
        "/images/products/product-4-bg-2.png",
      ],
    },
  },
  {
    title: "Apple Watch Ultra",
    reviews: 3,
    price: 99.0,
    discountedPrice: 29.0,
    id: 5,
    categorySlug: "phone-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-5-sm-1.png",
        "/images/products/product-5-sm-2.png",
      ],
      previews: [
        "/images/products/product-5-bg-1.png",
        "/images/products/product-5-bg-2.png",
      ],
    },
  },
  {
    title: "Logitech MX Master 3 Mouse",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 6,
    categorySlug: "computer-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-6-sm-1.png",
        "/images/products/product-6-sm-2.png",
      ],
      previews: [
        "/images/products/product-6-bg-1.png",
        "/images/products/product-6-bg-2.png",
      ],
    },
  },
  {
    title: "Apple iPad Air 5th Gen - 64GB",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 7,
    categorySlug: "ipad-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-7-sm-1.png",
        "/images/products/product-7-sm-2.png",
      ],
      previews: [
        "/images/products/product-7-bg-1.png",
        "/images/products/product-7-bg-2.png",
      ],
    },
  },
  {
    title: "Asus RT Dual Band Router",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 8,
    categorySlug: "computer-accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-8-sm-1.png",
        "/images/products/product-8-sm-2.png",
      ],
      previews: [
        "/images/products/product-8-bg-1.png",
        "/images/products/product-8-bg-2.png",
      ],
    },
  },
  {
    title: "Classic Canvas Messenger Bag",
    reviews: 8,
    price: 49.0,
    discountedPrice: 39.0,
    id: 9,
    categorySlug: "bags",
    imgs: {
      thumbnails: [
        "/images/products/product-1-sm-1.png",
        "/images/products/product-1-sm-2.png",
      ],
      previews: [
        "/images/products/product-1-bg-1.png",
        "/images/products/product-1-bg-2.png",
      ],
    },
  },
  {
    title: "Bluetooth Speaker Mini Boom",
    reviews: 12,
    price: 79.0,
    discountedPrice: 59.0,
    id: 10,
    categorySlug: "airpods-and-speakers",
    imgs: {
      thumbnails: [
        "/images/products/product-2-sm-1.png",
        "/images/products/product-2-sm-2.png",
      ],
      previews: [
        "/images/products/product-2-bg-1.png",
        "/images/products/product-2-bg-2.png",
      ],
    },
  },
  {
    title: "20W USB‑C Fast Charger",
    reviews: 25,
    price: 29.0,
    discountedPrice: 19.0,
    id: 11,
    categorySlug: "chargers",
    imgs: {
      thumbnails: [
        "/images/products/product-3-sm-1.png",
        "/images/products/product-3-sm-2.png",
      ],
      previews: [
        "/images/products/product-3-bg-1.png",
        "/images/products/product-3-bg-2.png",
      ],
    },
  },
  {
    title: "1TB Portable Hard Disk",
    reviews: 33,
    price: 119.0,
    discountedPrice: 89.0,
    id: 12,
    categorySlug: "hard-disks",
    imgs: {
      thumbnails: [
        "/images/products/product-4-sm-1.png",
        "/images/products/product-4-sm-2.png",
      ],
      previews: [
        "/images/products/product-4-bg-1.png",
        "/images/products/product-4-bg-2.png",
      ],
    },
  },
  {
    title: "Custom Printed Mug",
    reviews: 18,
    price: 15.0,
    discountedPrice: 12.0,
    id: 13,
    categorySlug: "printed-stuff",
    imgs: {
      thumbnails: [
        "/images/products/product-5-sm-1.png",
        "/images/products/product-5-sm-2.png",
      ],
      previews: [
        "/images/products/product-5-bg-1.png",
        "/images/products/product-5-bg-2.png",
      ],
    },
  },
  {
    title: "Gift Package – Tech Essentials",
    reviews: 7,
    price: 149.0,
    discountedPrice: 129.0,
    id: 14,
    categorySlug: "gift-packages",
    imgs: {
      thumbnails: [
        "/images/products/product-6-sm-1.png",
        "/images/products/product-6-sm-2.png",
      ],
      previews: [
        "/images/products/product-6-bg-1.png",
        "/images/products/product-6-bg-2.png",
      ],
    },
  },
];

export default shopData;
