"use client";
import React from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";

const BestSeller = () => {
  const { products, loading, error } = useProducts({ featured: true, limit: 6 });

  if (loading) {
    return (
      <section id="best-sellers" className="overflow-hidden scroll-mt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <Image
                  src="/images/icons/icon-07.svg"
                  alt="icon"
                  width={17}
                  height={17}
                />
                This Month
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                Best Sellers
              </h2>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading best sellers...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="best-sellers" className="overflow-hidden scroll-mt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading products: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="best-sellers" className="overflow-hidden scroll-mt-28">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {/* <!-- Best Sellers item --> */}
          {products.length > 0 ? (
            products.map((item, key) => (
              <SingleItem item={item} key={key} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No best sellers available at the moment.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
