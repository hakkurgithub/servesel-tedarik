import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta girin." }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalı." }),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  company: z.string().min(2),
  taxNo: z.string().min(5),
  address: z.string().min(5),
  phone: z.string().min(10),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  price: z.number().min(0),
  stock: z.number().min(0),
  image: z.string().url(),
  categoryId: z.number().int(),
  public: z.boolean().optional(),
});

export const orderSchema = z.object({
  buyerId: z.number().int(),
  items: z.array(
    z.object({
      productId: z.number().int(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ),
  total: z.number().min(0),
});
