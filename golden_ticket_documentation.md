# Golden Ticket System Documentation

## Overview
The Golden Ticket system is a promotional feature for Pickle+ that randomly presents users with sponsored rewards for physical merchandise or discounts as they navigate the platform.

**Sprint Code:** PKL-278651-GAME-0005-GOLD and PKL-278651-GAME-0005-GOLD-ENH

## Architecture

### Components
1. **Database Tables**
   - `sponsors` - Stores sponsor information (name, logo, website, etc.)
   - `golden_tickets` - Stores ticket data (title, description, appearance rate, etc.)
   - `golden_ticket_claims` - Tracks user claims and redemption status

2. **Frontend Components**
   - `GoldenTicketCard` - Displays in-app notification of available ticket
   - `GoldenTicketPreview` - Admin preview of ticket appearance
   - `GoldenTicketForm` - Admin form for creating/editing tickets
   - `SponsorForm` - Admin form for sponsor management
   - `SponsorList` - Admin interface for sponsor listing and actions
   - `FileUploadField` - Reusable component for file uploads

3. **Services and Utilities**
   - `fileUploadService` - Handles file upload validation and processing
   - `goldenTicketApi` - API client for golden ticket CRUD operations
   - `GoldenTicketContext` - Context provider for ticket state management

## User Flow
1. User navigates the platform
2. Based on probability settings, a Golden Ticket may appear
3. User claims the ticket
4. User reveals the sponsor
5. User can redeem reward according to sponsor terms

## Admin Flow
1. Admin creates sponsors with logos
2. Admin creates Golden Tickets with:
   - Basic information (title, description)
   - Reward details
   - Appearance settings (rate, page selection)
   - Sponsor association
   - Optional promotional image

## Implementation Details

### File Upload Process
- Direct file uploads for sponsor logos and promotional images
- Server-side validation for security
- File storage in `/uploads/sponsors/` and `/uploads/golden-tickets/`
- Preview capabilities in admin interface

### Ticket Display Process
1. Context provider checks appearance probability on page load
2. If criteria met, ticket is fetched and displayed
3. Animation brings ticket into view
4. User interaction is tracked

## Remaining Tasks

### High Priority
1. **Backend Optimization**
   - Improve database queries for ticket selection
   - Add caching layer for frequently accessed sponsors

2. **User Experience Enhancements**
   - Add analytics tracking for ticket interactions
   - Implement A/B testing framework for different ticket designs

3. **Mobile Responsiveness**
   - Test and optimize across various device sizes
   - Ensure animations work smoothly on mobile devices

### Medium Priority
1. **Admin Features**
   - Add dashboard for ticket performance metrics
   - Implement bulk operations for tickets
   - Add campaign management features

2. **User Features**
   - Create user history page for claimed tickets
   - Add notification preferences

### Low Priority
1. **Extended Integrations**
   - Add export functionality for ticket data
   - Implement webhook system for external systems

## Technical Notes

### Image Handling
- Images are stored as files on the server
- Paths are stored in the database
- Both direct URL and file path options are supported
- Responsive sizing is implemented using Tailwind CSS

### Mobile Responsiveness
- All components use responsive design with Tailwind breakpoints
- Different text and image sizes for mobile vs. desktop
- Optimized padding and spacing for smaller screens
- Text truncation and proper word breaks for content

### Future Considerations
- Consider implementing a CDN for image delivery
- Evaluate need for more sophisticated ticket targeting algorithms
- Explore integration with external reward fulfillment systems

## Code Quality Standards
- All components follow Framework 5.0 practices
- Proper error handling for file uploads
- Responsive design for all screen sizes
- Comprehensive logging for debugging
- Type safety using TypeScript interfaces

---

*Last updated: April 10, 2025*