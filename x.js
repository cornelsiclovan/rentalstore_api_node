// POST /api/returns {customerId, movieId}

// Return 401 if client is not logged in
// Return 400 if csutomerId is not provided
// Return 400 if movieId is not provided
// Return 404 if no rentral found for this customer/movie
// Return 400 if rental already processed

// Return 200 if valid request 
// Set the return data
// Calculate te rental fee
// Increase the stock
// Return the rental
