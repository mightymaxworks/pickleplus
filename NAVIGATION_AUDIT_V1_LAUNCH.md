# Navigation Audit - V1.0 Launch Version

**Date:** August 6, 2025  
**Status:** NEEDS CLEANUP  
**Priority:** HIGH - Remove non-launch features from all navigation

---

## 🔍 **NAVIGATION COMPONENTS IDENTIFIED**

### 1. **Desktop Sidebar** (`client/src/components/layout/Sidebar.tsx`)
**Status:** ✅ PROPERLY CONFIGURED
- Dashboard ✅
- Record Match ✅  
- Rankings ✅
- My Profile ✅
- Become a Coach (conditional) ✅
- Find Coaches ✅

### 2. **Header Dropdown** (`client/src/components/Header.tsx`)  
**Status:** ⚠️ NEEDS CLEANUP
- Dashboard ✅ (keep)
- Admin Panel ❌ (disable for launch - too advanced)

### 3. **Mobile Navigation** (`client/src/components/layout/MobileNavigation.tsx`)
**Status:** 🚨 MAJOR CLEANUP NEEDED
- Home ✅ (maps to Dashboard)
- Play ❌ (maps to /matches - should be Record Match)
- Community ❌ (DISABLE - not in V1.0)  
- Coaching ❌ (DISABLE - advanced feature)

### 4. **StandardLayout** (`client/src/components/layout/StandardLayout.tsx`)
**Status:** ✅ OK (uses other components)

---

## 🎯 **REQUIRED CHANGES**

### **Header Dropdown Menu - DISABLE Admin Panel**
```typescript
// REMOVE: Admin Panel access for streamlined launch
{user?.isAdmin && (
  <DropdownMenuItem onClick={() => setLocation("/admin/dashboard")}>
    <Shield className="mr-2 h-4 w-4" />
    Admin Panel  // ❌ REMOVE THIS
  </DropdownMenuItem>
)}
```

### **Mobile Navigation - COMPLETE OVERHAUL**  
Current nav items are NOT aligned with V1.0:
```typescript
// CURRENT (WRONG):
{ icon: <Home size={20} />, label: 'Home', path: '/dashboard' }, // ✅ OK
{ icon: <Calendar size={20} />, label: 'Play', path: '/matches' }, // ❌ Wrong path
{ icon: <Users size={20} />, label: 'Community', path: '/communities' }, // ❌ DISABLE  
{ icon: <Award size={20} />, label: 'Coaching', path: '/coach' } // ❌ DISABLE

// SHOULD BE (V1.0 LAUNCH):
{ icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' }, // ✅
{ icon: <PlusCircle size={20} />, label: 'Record Match', path: '/record-match' }, // ✅
{ icon: <TrendingUp size={20} />, label: 'Rankings', path: '/leaderboard' }, // ✅
{ icon: <User size={20} />, label: 'Profile', path: '/profile' } // ✅
```

---

## 🚫 **FEATURES TO DISABLE/REMOVE**

### **From All Navigation:**
1. **Community/Social Features**
   - Community page links
   - Social connections
   - Community creation

2. **Advanced Coaching Features** 
   - Coach dashboard/hub
   - Advanced coaching tools
   - Business analytics

3. **Tournament Management**
   - Tournament creation
   - Tournament admin
   - Event management

4. **Administrative Features**
   - Admin panel (hide in header dropdown)
   - System tools
   - User management

5. **Advanced Analytics**
   - Business intelligence
   - Advanced reporting
   - CourtIQ tools

---

## 📱 **CORRECT V1.0 NAVIGATION STRUCTURE**

### **Desktop Sidebar (4 Core + 2 Coach Sections)**
1. Dashboard
2. Record Match  
3. Rankings
4. My Profile
5. Become a Coach (conditional)
6. Find Coaches (conditional)

### **Mobile Navigation (4 Core Items)**
1. Dashboard
2. Record Match
3. Rankings  
4. Profile

### **Header Dropdown (Minimal)**
1. Dashboard
2. Logout
   
*(Admin Panel disabled for launch)*

---

## 🎯 **SUCCESS CRITERIA**

After cleanup, users should only see:
- ✅ Core player functionality
- ✅ Basic coach application/discovery
- ✅ Clean, focused navigation
- ❌ NO advanced/complex features
- ❌ NO overwhelming menu options
- ❌ NO disabled/broken feature links

---

## 🚨 **IMMEDIATE ACTIONS REQUIRED**

1. **Fix Mobile Navigation** - Replace community/coaching with core features
2. **Clean Header Dropdown** - Remove admin panel for launch  
3. **Fix Sidebar Type Errors** - Update User type for isCoach/rankingPoints
4. **Test All Navigation** - Ensure all links work correctly
5. **Verify Feature Alignment** - All nav items should lead to enabled features

---

*This audit ensures navigation perfectly aligns with V1.0 streamlined launch experience.*