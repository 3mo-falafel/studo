"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CheckoutForm from "./CheckoutForm";

const Checkout = () => {
  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <CheckoutForm />
      </section>
    </>
  );
};

export default Checkout;
