import React from 'react';
import ShoppingCart from 'common/ShoppingCart';

interface ShoppingCartInterface {
  cart: number[];
  addItem: (equipId: number) => void;
  removeItem: (equipId: number) => void;
  clearCart: () => void;
  submit: (
    onSuccess: () => void,
    onFailure: (numbers: number[]) => void,
  ) => void;
}

const ShoppingContext = React.createContext<ShoppingCartInterface | null>(null);

export const useShopping = (): ShoppingCartInterface => {
  const shoppingCart = React.useContext(ShoppingContext);
  if (!shoppingCart) {
    throw new Error('Cannot find ShoppingProvider');
  }
  return shoppingCart;
};

export const ShoppingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const shoppingCart = new ShoppingCart();
  const [cart, setCart] = React.useState<number[]>(shoppingCart.getItems());

  const addItem = (equipId: number) => {
    if (shoppingCart.addItem(equipId)) {
      setCart(shoppingCart.getItems());
    }
  };

  const removeItem = (equipId: number) => {
    if (shoppingCart.removeItem(equipId)) {
      setCart(shoppingCart.getItems());
    }
  };

  const clearCart = () => {
    shoppingCart.clear();
    setCart(shoppingCart.getItems());
  };

  const submit = (
    onSuccess: () => void,
    onFailure: (numbers: number[]) => void,
  ) => {
    shoppingCart.submit(onSuccess, onFailure);
  };

  return (
    <ShoppingContext.Provider
      value={{ cart, addItem, removeItem, clearCart, submit }}
    >
      {children}
    </ShoppingContext.Provider>
  );
};

export default ShoppingContext;
