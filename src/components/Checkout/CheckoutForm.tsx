"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

interface CheckoutFormData {
  fullName: string;
  whatsapp: string;
  deliveryOption: 'free_pickup' | 'home_delivery';
}

const CheckoutForm = () => {
  const router = useRouter();
  const { items } = useSelector((state: RootState) => state.cartReducer);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    whatsapp: '',
    deliveryOption: 'free_pickup'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = formData.deliveryOption === 'home_delivery' ? 20 : 0;
  
  const subtotal = items.reduce((total, item) => {
    const price = item.discountedPrice || item.price;
    return total + (Number(price) * item.quantity);
  }, 0);
  
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    
    if (!formData.whatsapp.trim()) {
      setError('WhatsApp number is required');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          whatsapp: formData.whatsapp,
          deliveryOption: formData.deliveryOption,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Clear cart
        // You might want to dispatch a clear cart action here
        router.push('/mail-success');
      } else {
        setError(result.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
          {/* Checkout left */}
          <div className="lg:max-w-[670px] w-full">
            {/* Customer Information */}
            <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
              <h3 className="font-medium text-xl text-dark mb-6">Customer Information</h3>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="block mb-2.5 text-dark">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block mb-2.5 text-dark">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    placeholder="Enter your WhatsApp number"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 text-dark">Delivery Option *</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="free_pickup"
                        checked={formData.deliveryOption === 'free_pickup'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="text-dark">Free Pickup</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="home_delivery"
                        checked={formData.deliveryOption === 'home_delivery'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="text-dark">Home Delivery (+20 shekels)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
                {error}
              </div>
            )}
          </div>

          {/* Checkout right */}
          <div className="max-w-[455px] w-full">
            {/* Order Summary */}
            <div className="bg-white shadow-1 rounded-[10px]">
              <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                <h3 className="font-medium text-xl text-dark">Your Order</h3>
              </div>

              <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                {/* Header */}
                <div className="flex items-center justify-between py-5 border-b border-gray-3">
                  <div>
                    <h4 className="font-medium text-dark">Product</h4>
                  </div>
                  <div>
                    <h4 className="font-medium text-dark text-right">Subtotal</h4>
                  </div>
                </div>

                {/* Product items */}
                {items.map((item) => {
                  const price = item.discountedPrice || item.price;
                  const itemTotal = Number(price) * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">{item.title}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">${itemTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Delivery fee */}
                <div className="flex items-center justify-between py-5 border-b border-gray-3">
                  <div>
                    <p className="text-dark">Delivery Fee</p>
                  </div>
                  <div>
                    <p className="text-dark text-right">${deliveryFee.toFixed(2)}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-5">
                  <div>
                    <p className="font-medium text-lg text-dark">Total</p>
                  </div>
                  <div>
                    <p className="font-medium text-lg text-dark text-right">
                      ${total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout button */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Process to Checkout'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
