const initialState = {
    address: '',
    city: '',
    phoneNo: '',
    postalCode: '',
    country: 'Philippines',
  };
  
  const shippingDetails = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_SHIPPING_DETAILS':
        return {
          ...state,
          ...action.payload
        };
      default:
        return state;
    }
  };
  
  export default shippingDetails;