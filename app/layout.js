export const metadata = {
  title: 'A2Z Wholesale & Retail Super App',
  description: '20-30km Hyper-Local Delivery for Groceries, Food, Medicine & Electronics',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
