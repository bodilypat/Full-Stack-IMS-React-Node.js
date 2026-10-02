Full-Stack-Inventory-Management-System(IMS)  
├── Frontend/ (React • JavaScript • HTML • CSS) components -> pages -> hooks -> services -> routes -> utils -> App.jsx
│   │
│   ├── index.html
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.png
│   ├── src/
│   │   ├── assets/                                         
│   │   │   ├── icons/                                 
│   │   │   ├── images/                             
│   │   │   ├── fonts/
│   │   │   └── styles/  
│   │   │       ├── global.css
│   │   │       ├── variables.css
│   │   │       ├── reset.css
│   │   │       └── typography.css                        
│   │   │
│   │   ├── components/                                     
│   │   │   ├── ui/  
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx 
│   │   │   │   ├── Select.jsx 
│   │   │   │   ├── Modal.jsx 
│   │   │   │   ├── Table.jsx 
│   │   │   │   ├── Badge.jsx 
│   │   │   │   ├── Spinner.jsx 
│   │   │   │   ├── Pagination.jsx 
│   │   │   │   ├── Alert.jsx
│   │   │   │   └── Card.jsx      
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx 
│   │   │   │   ├── Sidebar.jsx 
│   │   │   │   ├── Navbar.jsx 
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── PageHeader.jsx      
│   │   │   └── common/
│   │   │       ├── EmptyState.jsx
│   │   │       ├── ErrorState.jsx  
│   │   │       ├── LoadingState.jsx
│   │   │       └── ConfirmDialog.jsx
│   │   │  
│   │   ├── features/                                       
│   │   │      ├── auth/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── LoginForm.jsx
│   │   │  	│	│   ├── RegisterForm.jsx 
│   │   │  	│	│   ├── ForgotPasswordForm.jsx 
│   │   │  	│	│   ├── ResetPasswordForm.jsx 
│   │   │      │    │   └── ProtectedRoute.jsx 
│   │   │  	│	├── pages/                               
│   │   │  	│	│   ├── Login.jsx 
│   │   │  	│	│   ├── Register.jsx 
│   │   │  	│	│   ├── ForgotPassword.jsx 
│   │   │      │    │   └── ResetPassword.jsx 
│   │   │  	│	├── hooks/                               
│   │   │      │    │   └── useAuth.jsx
│   │   │  	│	├── context/                             
│   │   │      │    │   └── index.js
│   │   │  	│	├── services/                            
│   │   │      │    │   └── authService.js 
│   │   │  	│	├── utils/                               
│   │   │  	│	│   ├── authHelpers.js
│   │   │  	│	│   ├── authValidators.js
│   │   │  	│	│   ├── authMapper.js 
│   │   │  	│	│   ├── authStorage.js
│   │   │      │    │   └── index.js
│   │   │  	│	├── validation/                              
│   │   │      │    │   └── authValidation.js
│   │   │      │    └── index.js
│   │   │      │
│   │   │      ├── dashboard/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── StateCard.jsx
│   │   │  	│	│   ├── SalesChart.jsx 
│   │   │  	│	│   ├── InventoryChart.jsx 
│   │   │  	│	│   ├── LowStockList.jsx 
│   │   │  	│	│   ├── RecentTransactions.jsx
│   │   │  	│	│   ├── RecentSales.jsx
│   │   │      │    │   └── TopProducts.jsx 
│   │   │  	│	├── pages/                               
│   │   │      │    │   └── Dashboard.jsx 
│   │   │  	│	├── hooks/                               
│   │   │      │    │   └── useDashboard.jsx
│   │   │  	│	├── services/                            
│   │   │      │    │   └── dashboardService.js 
│   │   │  	│	├── utils/                               
│   │   │      │    │   └── udashboardUtils.js 
│   │   │      │    └── index.js
│   │   │      │
│   │   │      ├── products/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── ProductTable.jsx
│   │   │  	│	│   ├── ProductForm.jsx 
│   │   │  	│	│   ├── ProductCard.jsx 
│   │   │  	│	│   ├── ProductDetails.jsx 
│   │   │  	│	│   ├── ProductSearch.jsx
│   │   │  	│	│   ├── ProductFilters.jsx
│   │   │  	│	│   ├── ProductStatus.jsx
│   │   │      │    │   └── ProductDeleteDialog.jsx 
│   │   │  	│	├── pages/                               
│   │   │  	│	│   ├── Products.jsx 
│   │   │  	│	│   ├── AddProduct.jsx 
│   │   │  	│	│   ├── EditProduct.jsx 
│   │   │      │    │   └── ProductView.jsx 
│   │   │  	│	├── hooks/                               
│   │   │      │    │   └── useProducts.js
│   │   │  	│	├── services/                            
│   │   │      │    │   └── productService.js 
│   │   │  	│	├── validation/                               
│   │   │      │    │   └── productValidation.js 
│   │   │  	│	├── utils/                              
│   │   │      │    │   └── productUtils.js
│   │   │      │    └── index.js
│   │   │      │
│   │   │      ├── suppliers/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── SupplierTable.jsx
│   │   │  	│	│   ├── SupplierForm.jsx 
│   │   │  	│	│   ├── SupplierDetails.jsx 
│   │   │  	│	│   ├── SupplierCard.jsx 
│   │   │  	│	│   ├── SupplierStatus.jsx
│   │   │  	│	│   ├── SupplierSearch.jsx
│   │   │  	│	│   ├── SupplierFilters.jsx
│   │   │  	│	│   ├── SupplierProducts.jsx
│   │   │  	│	│   ├── SupplierPurchaseHistory.jsx
│   │   │  	│	│   ├── SupplierPaymentInfo.jsx
│   │   │      │    │   └── SupplierDeleteDialog.jsx 
│   │   │  	│	├── pages/                               
│   │   │  	│	│   ├── Suppliers.jsx 
│   │   │  	│	│   ├── AddSupplier.jsx 
│   │   │  	│	│   ├── EditSupplier.jsx 
│   │   │  	│	│   ├── SupplierView.jsx 
│   │   │  	│	│   ├── SupplierProductsPage.jsx
│   │   │      │    │   └── SupplierHistory.jsx 
│   │   │  	│	├── hooks/                               
│   │   │      │    │   └── useSuppliers.js
│   │   │  	│	├── services/                            
│   │   │      │    │   └── supplierService.js 
│   │   │  	│	├── validation/                               
│   │   │      │    │   └── supplierValidation.js 
│   │   │  	│	├── utils/                              
│   │   │      │    │   └── supplierUtils.js
│   │   │      │    └── index.js
│   │   │      │
│   │   │      ├── inventory/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── InventoryTable.jsx
│   │   │  	│	│   ├── InventoryCard.jsx 
│   │   │  	│	│   ├── StockStatus.jsx 
│   │   │  	│	│   ├── StockInForm.jsx 
│   │   │  	│	│   ├── StockOutForm.jsx
│   │   │  	│	│   ├── StockAdjustmentForm.jsx
│   │   │  	│	│   ├── StockTransferForm.jsx
│   │   │  	│	│   ├── InventoryFilters.jsx
│   │   │  	│	│   ├── InventorySearch.jsx
│   │   │  	│	│   ├── LowStockAlert.jsx
│   │   │      │    │   └── TransactionHistory.jsx 
│   │   │  	│	├── pages/                               
│   │   │  	│	│   ├── Inventory.jsx 
│   │   │  	│	│   ├── StockIn.jsx 
│   │   │  	│	│   ├── StockOut.jsx 
│   │   │  	│	│   ├── StockAdjustment.jsx 
│   │   │  	│	│   ├── StockTransfer.jsx 
│   │   │      │    │   └── InventoryHistory.jsx 
│   │   │  	│	├── hooks/                               
│   │   │      │    │   └── useInventory.js 
│   │   │  	│	├── services/                            
│   │   │      │    │   └── inventoryService.js 
│   │   │  	│	├── utils/                              
│   │   │      │    │   └── inventoryUtils.js
│   │   │      │    └── index.js
│   │   │      │
│   │   │      ├── purchases/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── PurchaseTable.jsx
│   │   │  	│	│   ├── PurchaseForm.jsx 
│   │   │  	│	│   ├── PurchaseDetails.jsx 
│   │   │  	│	│   ├── PurchaseItemForm.jsx 
│   │   │  	│	│   ├── PurchaseItemTable.jsx
│   │   │  	│	│   ├── SupplierSelect.jsx
│   │   │  	│	│   ├── PurchaseStatus.jsx
│   │   │  	│	│   ├── PaymentStatus.jsx
│   │   │  	│	│   ├── ReceivePurchaseForm.jsx
│   │   │  	│	│   ├── PurchaseFilters.jsx
│   │   │      │    │   └── PurchaseDeleteDialog.jsx 
│   │   │      │    │
│   │   │  	│	├── pages/                               
│   │   │  	│	│   ├── Purchase.jsx 
│   │   │  	│	│   ├── CreatePurchase.jsx 
│   │   │  	│	│   ├── EditPurchase.jsx 
│   │   │  	│	│   ├── PurchaseView.jsx  
│   │   │      │    │   └── ReceivePurchase.jsx 
│   │   │      │    │
│   │   │  	│	├── hooks/                               
│   │   │      │    │   └── usePurchases.js 
│   │   │  	│	├── services/                            
│   │   │      │    │   └── purchaseService.js
│   │   │  	│	├── validation/                            
│   │   │      │    │   └── purchaseValidation.js 
│   │   │  	│	├── utils/                              
│   │   │      │    │   └── purchaseUtils.js
│   │   │      │    └── index.js
│   │   │      │
│   │   │      ├── sales/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── SalesTable.jsx
│   │   │  	│	│   ├── SalesForm.jsx 
│   │   │  	│	│   ├── SalesDetails.jsx 
│   │   │  	│	│   ├── SalesItemForm.jsx 
│   │   │  	│	│   ├── SalesItemTable.jsx 
│   │   │  	│	│   ├── CustomerSelect.jsx
│   │   │  	│	│   ├── ProductSelect.jsx
│   │   │  	│	│   ├── SalesStatus.jsx
│   │   │  	│	│   ├── PaymentStatus.jsx
│   │   │  	│	│   ├── PaymentForm.jsx
│   │   │  	│	│   ├── InvoicePreview.jsx
│   │   │  	│	│   ├── SalesFilters.jsx 
│   │   │      │    │   └── SalesDeleteDialog.jsx  
│   │   │  	│	├── pages/                               
│   │   │  	│	│   ├── Sales.jsx 
│   │   │  	│	│   ├── CreateSale.jsx 
│   │   │  	│	│   ├── EditSale.jsx 
│   │   │  	│	│   ├── SaleView.jsx 
│   │   │  	│	│   ├── Invoice.jsx 
│   │   │      │    │   └── Payments.jsx 
│   │   │  	│	├── hooks/                               
│   │   │      │    │   └── useSales.js 
│   │   │  	│	├── services/                            
│   │   │      │    │   └── salesService.js 
│   │   │  	│	├── validation/                              
│   │   │      │    │   └── salesValidation.js
│   │   │  	│	├── utils/                              
│   │   │      │    │   └── salesUtils.js
│   │   │      │    └── index.js
│   │   │      │
│   │   │      ├── reports/ 
│   │   │  	│	├── components/                         
│   │   │  	│	│   ├── ReportCard.jsx
│   │   │  	│	│   ├── ReportHeader.jsx 
│   │   │  	│	│   ├── ReportFilters.jsx 
│   │   │  	│	│   ├── DateRangePicker.jsx 
│   │   │  	│	│   ├── SalesChart.jsx
│   │   │  	│	│   ├── PurchaseChart.jsx
│   │   │  	│	│   ├── InventoryChart.jsx
│   │   │  	│	│   ├── ProfileChart.jsx
│   │   │  	│	│   ├── StockMovementChart.jsx
│   │   │  	│	│   ├── ReportTable.jsx
│   │   │  	│	│   ├── ReportSummary.jsx 
│   │   │      │    │   └── TransactionHistory.jsx 
│   │   │      │    │
│   │   │  	│	├── pages/                               
│   │   │  	│	│   ├── Reports.jsx 
│   │   │  	│	│   ├── SalesReport.jsx 
│   │   │  	│	│   ├── PurchaseReport.jsx 
│   │   │  	│	│   ├── InventoryReport.jsx 
│   │   │  	│	│   ├── ProfileReport.jsx 
│   │   │  	│	│   ├── StockMovementReport.jsx
│   │   │      │    │   └── ProductPerformanceReport.jsx 
│   │   │      │    │
│   │   │      │	├── hooks/                               
│   │   │      │    │   └── useReports.js 
│   │   │      │    ├── services/                            
│   │   │      │    │   └── reportService.js 
│   │   │      │	├── utils/                              
│   │   │      │    │   └── reportUtils.js
│   │   │      │    └── index.js
│   │   │      │
│   │   │      └── users/
│   │   │  		├── components/                         
│   │   │  		│   ├── UserTable.jsx
│   │   │  		│   ├── UserForm.jsx 
│   │   │  		│   ├── UserDetails.jsx 
│   │   │  		│   ├── UserAvatar.jsx 
│   │   │  		│   ├── UserStatus.jsx
│   │   │  		│   ├── PermissionList.jsx
│   │   │  		│   ├── UserFilters.jsx
│   │   │  		│   ├── UserSearch.jsx
│   │   │  		│   ├── ChangePasswordForm.jsx
│   │   │  		│   ├── UserActivity.jsx
│   │   │           │   └── UserDeleteDialog.jsx 
│   │   │  		├── pages/                               
│   │   │  		│   ├── Users.jsx 
│   │   │  		│   ├── AddUser.jsx 
│   │   │  		│   ├── EditUser.jsx 
│   │   │  		│   ├── UserView.jsx 
│   │   │  		│   ├── Roles.jsx 
│   │   │           │   └── UserProfile.jsx 
│   │   │  		├── hooks/                               
│   │   │           │   └── useUsers.js 
│   │   │  		├── services/                            
│   │   │           │   └── userService.js 
│   │   │  		├── utils/                              
│   │   │           │   └── userUtils.js
│   │   │           └── index.js
│   │   │
│   │   ├── hooks/                                       
│   │   │   ├── useDebounce.js                              
│   │   │   ├── usePagination.js                             
│   │   │   └── useModal.js
│   │   │
│   │   ├── services/                                    
│   │   │   ├── api.js                                   
│   │   │   └── uploadService.js 
│   │   │
│   │   ├── routes/                                  
│   │   │   ├── AppRoutes.jsx                        
│   │   │   ├── PrivateRoutes.jsx                            
│   │   │   └── routeConfig.js                                 
│   │   │
│   │   ├── utils/                                                                
│   │   │   ├── constants.js 
│   │   │   ├── formatters.js                             
│   │   │   ├── dateUtils.js                            
│   │   │   ├── currencyUtils.js                                                        
│   │   │   └── storage.js                         
│   │   │      
│   │   ├── App.jsx 
│   │   ├── main.jsx                                    
│   │   └── index.css    
│   │
│   ├── .env 
│   ├── .env.example 
│   ├── package.json                     
│   └── README.md           
│                            
├── Backend(Node.js)
│   ├── src/
│   │   │
│   │   ├── config/                                     
│   │   │   ├── database.js 
│   │   │   ├── env.js 
│   │   │   ├── logger.js 
│   │   │   └── index.js 
│   │   │
│   │   ├── middleware/                                     
│   │   │   ├── authMiddleware.js 
│   │   │   ├── roleMiddleware.js 
│   │   │   ├── validationMiddleware.js  
│   │   │   ├── uploadMiddleware.js 
│   │   │   ├── notFoundMiddleware.js 
│   │   │   └── errorMiddleware.js                 
│   │   │
│   │   ├── routes/
│   │   │   └── index.js
│   │   │
│   │   ├── features/                                
│   │   │   ├── auth/      
│   │   │   │   ├── controllers/
│   │   │   │   │   └── authController.js 
│   │   │   │   ├── services/
│   │   │   │   │   └── authService.js
│   │   │   │   ├── repositories/
│   │   │   │   │   └── authRepository.js
│   │   │   │   ├── routes/
│   │   │   │   │   └── authRoutes.js
│   │   │   │   ├── validators/
│   │   │   │   │   └── authValidator.js 
│   │   │   │   ├── middleware/
│   │   │   │	 │   ├── authenticate.js 
│   │   │   │   │   └── authorize.js 
│   │   │   │   ├── utils/
│   │   │   │	 │   ├── password.js  
│   │   │   │	 │   ├── token.js 
│   │   │   │   │   └── authHelpers.js 
│   │   │   │   ├── constants/
│   │   │   │   │   └── authConstants.js 
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── dashboard/      
│   │   │   │   ├── controllers/
│   │   │   │   │   └── dashboardController.js 
│   │   │   │   ├── services/
│   │   │   │   │   └── dashboardService.js
│   │   │   │   ├── repositories/
│   │   │   │   │   └── dashboardRepository.js
│   │   │   │   ├── routes/
│   │   │   │   │   └── dashboardRoutes.js
│   │   │   │   ├── validators/
│   │   │   │   │   └── dashboardValidator.js 
│   │   │   │   ├── utils/
│   │   │   │   │   └── dashboardUtils.js 
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── products/      
│   │   │   │   ├── controllers/
│   │   │   │   │   └── productController.js 
│   │   │   │   ├── services/
│   │   │   │   │   └── productService.js
│   │   │   │   ├── repositories/
│   │   │   │   │   └── productRepository.js
│   │   │   │   ├── routes/
│   │   │   │   │   └── productRoutes.js
│   │   │   │   ├── validators/
│   │   │   │   │   └── productValidator.js 
│   │   │   │   ├── utils/
│   │   │   │   │   └── productUtils.js 
│   │   │   │   ├── constants/
│   │   │   │   │   └── productConstants.js 
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── suppliers/      
│   │   │   │   ├── controllers/
│   │   │   │   │   └── supplierController.js 
│   │   │   │   ├── services/
│   │   │   │   │   └── supplierService.js
│   │   │   │   ├── repositories/
│   │   │   │   │   └── supplierRepository.js
│   │   │   │   ├── routes/
│   │   │   │   │   └── supplierRoutes.js
│   │   │   │   ├── validators/
│   │   │   │   │   └── supplierValidator.js 
│   │   │   │   ├── utils/
│   │   │   │   │   └── supplierUtils.js 
│   │   │   │   ├── constants/
│   │   │   │   │   └── supplierConstants.js 
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── inventory/      
│   │   │   │   ├── controllers/
│   │   │   │   │   └── inventoryController.js 
│   │   │   │   ├── services/
│   │   │   │   │   └── inventoryService.js
│   │   │   │   ├── repositories/
│   │   │   │   │   └── inventoryRepository.js
│   │   │   │   ├── routes/
│   │   │   │   │   └── inventoryRoutes.js
│   │   │   │   ├── validators/
│   │   │   │   │   └── inventoryValidator.js 
│   │   │   │   ├── utils/
│   │   │   │   │   └── inventoryUtils.js 
│   │   │   │   ├── constants/
│   │   │   │   │   └── inventoryConstants.js 
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── purchases/      
│   │   │   │   ├── controllers/
│   │   │   │	 │   ├── purchaseController.js 
│   │   │   │   │   └── purchaseItemController.js 
│   │   │   │   ├── services/
│   │   │   │	 │   ├── purchaseService.js 
│   │   │   │   │   └── purchaseItemService.js 
│   │   │   │   ├── repositories/
│   │   │   │   │   └── purchaseRepository.js
│   │   │   │   ├── routes/
│   │   │   │   │   └── purchaseRoutes.js
│   │   │   │   ├── validators/
│   │   │   │   │   └── purchaseValidator.js 
│   │   │   │   ├── utils/
│   │   │   │   │   └── purchaseUtils.js 
│   │   │   │   ├── constants/
│   │   │   │   │   └── purchaseConstants.js 
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── sales/      
│   │   │   │   ├── controllers/
│   │   │   │	 │   ├── saleController.js 
│   │   │   │	 │   ├── saleItemController.js
│   │   │   │	 │   ├── saleReturnController.js
│   │   │   │   │   └── paymentController.js 
│   │   │   │   ├── services/
│   │   │   │	 │   ├── saleService.js 
│   │   │   │	 │   ├── saleItemService.js
│   │   │   │	 │   ├── saleReturnService.js
│   │   │   │   │   └── paymentService.js 
│   │   │   │   ├── repositories/
│   │   │   │	 │   ├── saleRepository.js
│   │   │   │	 │   ├── saleReturnRepository.js
│   │   │   │   │   └── paymentRepository.js
│   │   │   │   ├── routes/
│   │   │   │	 │   ├── saleRoutes.js
│   │   │   │	 │   ├── saleReturnRoutes.js
│   │   │   │   │   └── paymentRoutes.js
│   │   │   │   ├── validators/
│   │   │   │	 │   ├── saleValidator.js 
│   │   │   │	 │   ├── saleReturnValidator.js 
│   │   │   │   │   └── paymentValidator.js 
│   │   │   │   ├── utils/
│   │   │   │   │   └── saleUtils.js 
│   │   │   │   ├── constants/
│   │   │   │   │   └── saleConstants.js 
│   │   │   │   └── index.js
│   │   │   │ 
│   │   │   ├── repors/      
│   │   │   │   ├── controllers/
│   │   │   │	 │   ├── reportController.js 
│   │   │   │	 │   ├── saleReportController.js
│   │   │   │	 │   ├── purchaseReportController.js
│   │   │   │	 │   ├── inventoryReportController.js
│   │   │   │	 │   ├── profitReportController.js
│   │   │   │	 │   ├── stockMovementReportController.js
│   │   │   │   │   └── productPerformanceReportController.js 
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │	 │   ├── reportService.js 
│   │   │   │	 │   ├── salesReportService.js
│   │   │   │	 │   ├── purchaseReportService.js
│   │   │   │	 │   ├── inventoryReportService.js 
│   │   │   │	 │   ├── profitReportService.js 
│   │   │   │	 │   ├── stockMovementReportService.js 
│   │   │   │   │   └── productPerformanceReportService.js 
│   │   │   │   │
│   │   │   │   ├── repositories/
│   │   │   │	 │   ├── reportRepository.js
│   │   │   │	 │   ├── saleReportRepository.js 
│   │   │   │	 │   ├── purchaseReportRepository.js 
│   │   │   │	 │   ├── inventoryReportRepository.js 
│   │   │   │	 │   ├── profitReportRepository.js 
│   │   │   │	 │   ├── stockMovementReportRepository.js 
│   │   │   │   │   └── productPerformanceReportRepository.js
│   │   │   │   │
│   │   │   │   ├── routes/
│   │   │   │   │   └── reportRoutes.js 
│   │   │   │   ├── validators/
│   │   │   │   │   └── reportValidator.js 
│   │   │   │   ├── utils/
│   │   │   │   │   └── reportUtils.js 
│   │   │   │   ├── constants/
│   │   │   │   │   └── reportConstants.js 
│   │   │   │   └── index.js
│   │   │   │ 
│   │   │   └── settings/
│   │   │       ├── controllers/
│   │   │  	 │   ├── settingsController.js 
│   │   │  	 │   ├── companySettingsController.js
│   │   │  	 │   ├── inventorySettingsController.js
│   │   │  	 │   ├── salesSettingsController.js
│   │   │       │   └── notificationSettingsController.js 
│   │   │       │
│   │   │       ├── services/
│   │   │  	 │   ├── settingsService.js 
│   │   │  	 │   ├── companySettingsService.js
│   │   │  	 │   ├── inventorySettingsService.js
│   │   │  	 │   ├── salesSettingsService.js 
│   │   │       │   └── notificationSettingsService.js 
│   │   │       │
│   │   │       ├── repositories/
│   │   │       │   └── settingsRepository.js
│   │   │       ├── routes/
│   │   │       │   └── settingsRoutes.js 
│   │   │       ├── validators/
│   │   │       │   └── settingsValidator.js 
│   │   │       ├── utils/
│   │   │       │   └── settingsUtils.js 
│   │   │       ├── constants/
│   │   │       │   └── settingsConstants.js 
│   │   │       └── index.js
│   │   │
│   │   ├── utils/                                 
│   │   │   ├── apiResponse.js
│   │   │   ├── asyncHandler.js 
│   │   │   ├── pagination.js  
│   │   │   ├── generateNumber.js 
│   │   │   └── dateUtils.js  
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │                         
│   ├── prisma/ 
│   │   ├── schema.prisma                                   
│   │   └── seed.js 
│   ├── uploads/
│   ├── tests/
│   ├── .env
│   ├── .env.example 
│   ├── package.json
│   └── README.md


                    INVENTORY MANAGEMENT SYSTEM
                              │
             ┌────────────────┴────────────────┐
             │                                 │
       React Frontend                    Node.js Backend
             │                                 │
       Feature Pages                    Feature Routes
             │                                 │
        Custom Hooks                    Controllers
             │                                 │
        Services/API                    Services
             │                                 │
        REST Requests                   Repositories
             │                                 │
             └───────────────┬─────────────────┘
                             │
                           Prisma
                             │
                        PostgreSQL

