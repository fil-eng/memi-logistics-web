
UI (Login/Register)
   ↓
Dispatch Action
   ↓
AuthProvider (Context)
   ↓
Reducer (State Update)
   ↓
Service Layer (API calls)
   ↓
Backend (Java + JWT)
<!-- ************************************************************** -->
src/
  assets/
  components/
    layout/
      Navbar/
      Footer/
    routing/
      ProtectedRoute.jsx
    ui/
      Button.jsx
      Input.jsx
      Card.jsx
  pages/
    Home/
    Login/
    Register/
    ShipperDashboard/
    CarrierDashboard/
    AdminDashboard/
    ShipmentCreate/
    ShipmentDetails/
    Tracking/
    Profile/
  state/
    auth/
    auth.types.js
    auth.reducer.js
    auth.initialState.js
    AuthProvider.jsx
    useAuth.js
  services/
    apiClient.js
    auth.service.js
    shipment.service.js
    user.service.js
    tracking.service.js
  utils/
    token.js
    validators.js
  App.jsx


  <!-- ************************************************************ -->
  3) Main modules
A. Auth Module

Handles:

registration
login
JWT issuing and validation
role-based access
session restore
logout
Roles
SHIPPER
CARRIER
ADMIN
B. User Module

Handles:

profile management
user verification
business details
carrier documents
shipper company info
C. Shipment Module

Handles:

shipment creation
cargo details
pickup and drop-off locations
vehicle assignment
shipment status
delivery confirmation
D. Matching Module

Handles:

finding available carriers
matching shipments to trucks
filtering by route, capacity, timing, and vehicle type
E. Tracking Module

Handles:

shipment status updates
ETA updates
live movement visibility
delivery history
F. Trust Module

Handles:

ratings
reviews
carrier quality score
shipper behavior score
dispute records
verification status
G. Notification Module

Handles:

email notifications
SMS notifications later
in-app alerts
shipment updates
booking updates
H. Admin Module

Handles:

user approval
dispute resolution
platform monitoring
abuse control
operational oversight