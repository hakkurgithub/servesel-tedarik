import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin kullanıcı
  const adminPassword = await bcrypt.hash("123456", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
      company: "Admin Şirketi",
      taxNo: "1234567890",
      address: "Admin Adresi",
      phone: "05555555555",
    },
  });

  // Kategoriler
  const categories = [
    { name: "Yağlar", slug: "yaglar" },
    { name: "Salçalar", slug: "salcalar" },
    { name: "Süt Ürünleri", slug: "sut-urunleri" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Ürünler
  const products = [
    {
      name: "Ayçiçek Yağı 5L",
      slug: "aycicek-yagi-5l",
      description: "Kaliteli ayçiçek yağı.",
      price: 250,
      stock: 100,
      image: "/aydin-zeytinyagi-5lt.jpg",
      categoryId: 1,
      sellerId: 1,
      public: true,
    },
    {
      name: "Zeytinyağı 10L",
      slug: "zeytinyagi-10l",
      description: "Doğal zeytinyağı.",
      price: 600,
      stock: 50,
      image: "/aydin-zeytinyagi-10lt.jpg",
      categoryId: 1,
      sellerId: 1,
      public: true,
    },
    {
      name: "Domates Salçası 20kg",
      slug: "domates-salcasi-20kg",
      description: "Ev yapımı domates salçası.",
      price: 900,
      stock: 30,
      image: "/domates-salcasi-20kg.jpg",
      categoryId: 2,
      sellerId: 1,
      public: true,
    },
    {
      name: "Biber Salçası 20kg",
      slug: "biber-salcasi-20kg",
      description: "Doğal biber salçası.",
      price: 950,
      stock: 25,
      image: "/biber-salcasi-20kg.jpg",
      categoryId: 2,
      sellerId: 1,
      public: true,
    },
    {
      name: "Rize Tereyağı",
      slug: "rize-tereyagi",
      description: "Hakiki Rize tereyağı.",
      price: 400,
      stock: 40,
      image: "/rize-tereyegi.jpg",
      categoryId: 3,
      sellerId: 1,
      public: true,
    },
    {
      name: "Hatay Zeytinyağı 5L",
      slug: "hatay-zeytinyagi-5l",
      description: "Hatay bölgesinden zeytinyağı.",
      price: 550,
      stock: 60,
      image: "/hatay-zeytinyagi-5-litre.jpg",
      categoryId: 1,
      sellerId: 1,
      public: true,
    },
    {
      name: "Sesa 1L Ayçiçek Yağı",
      slug: "sesa-1l-aycicek-yagi",
      description: "Sesa marka ayçiçek yağı.",
      price: 60,
      stock: 200,
      image: "/sesa-1-litre.jpg",
      categoryId: 1,
      sellerId: 1,
      public: true,
    },
    {
      name: "Sesa 17L Teneke Yağ",
      slug: "sesa-17l-teneke-yag",
      description: "Büyük boy teneke yağ.",
      price: 1200,
      stock: 10,
      image: "/sesa-17-litre-teneke.jpg",
      categoryId: 1,
      sellerId: 1,
      public: true,
    },
    {
      name: "Sesa Mısır Yağı",
      slug: "sesa-misir-yagi",
      description: "Sesa marka mısır yağı.",
      price: 80,
      stock: 150,
      image: "/sesa-misir-yagi.jpg",
      categoryId: 1,
      sellerId: 1,
      public: true,
    },
    {
      name: "Sigla Yağı",
      slug: "sigla-yagi",
      description: "Doğal sigla yağı.",
      price: 300,
      stock: 20,
      image: "/sigla-yagi.jpg",
      categoryId: 1,
      sellerId: 1,
      public: true,
    },
  ];
  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
