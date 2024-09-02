import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import removeIcon from '../../assets/cross_icon.png';

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    try {
      const response = await fetch('http://localhost:4000/allproducts');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    try {
      const response = await fetch('http://localhost:4000/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      await fetchInfo(); // Refresh the product list after removal
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  return (
    <div className='listproduct'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproduct">
        <hr />
        {allProducts.map((product) => (
          <div key={product.id} className="listproduct-format-main listproduct-format">
            <img className='lisproduct-product-icon' src={product.image} alt={product.name} />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
            <p>${product.new_price}</p>
            <p>{product.category}</p>
            <img onClick={() => removeProduct(product.id)} className='lisproduct-remove-icon' src={removeIcon} alt="Remove" />
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
