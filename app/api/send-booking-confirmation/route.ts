import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { formatCurrency } from '@/lib/currency';
import { getFullVendorUrl } from '@/lib/vendor-url';

interface BookingEmailRequest {
  bookingId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get booking ID from request
    const { bookingId }: BookingEmailRequest = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch complete booking details with vendor information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        vendor:vendors (
          name,
          description,
          location,
          currency,
          profile_picture_url,
          user_id
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('❌ Failed to fetch booking:', bookingError);
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Fetch vendor email from auth.users
    let vendorEmail = null;
    if (booking.vendor?.user_id) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(booking.vendor.user_id);
      if (!userError && userData?.user?.email) {
        vendorEmail = userData.user.email;
        console.log('✅ Vendor email found:', vendorEmail);
      } else {
        console.warn('⚠️ Could not fetch vendor email:', userError?.message);
      }
    }

    // Ensure we have required email data
    if (!booking.customer_email || !booking.customer_name) {
      return NextResponse.json(
        { success: false, error: 'Missing customer email or name' },
        { status: 400 }
      );
    }

    // Parse booking details (activities info)
    const bookingDetails = Array.isArray(booking.booking_details) 
      ? booking.booking_details 
      : [];
    
    // Format date and time
    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const bookingTime = booking.booking_time;

    // Create beautiful email HTML content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - ${booking.booking_number}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 600; }
        .header p { margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .booking-card { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border-left: 6px solid #0ea5e9; }
        .booking-number { font-size: 28px; font-weight: 700; color: #0ea5e9; margin-bottom: 15px; text-align: center; }
        .activity-item { background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .activity-title { font-weight: 600; font-size: 18px; color: #1e293b; margin-bottom: 8px; }
        .activity-price { color: #0ea5e9; font-weight: 700; font-size: 16px; }
        .info-section { margin-bottom: 35px; }
        .info-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px; border-bottom: 3px solid #0ea5e9; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .info-item { margin-bottom: 12px; font-size: 16px; }
        .info-label { font-weight: 600; color: #64748b; margin-right: 8px; }
        .steps { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #10b981; }
        .step { display: flex; align-items: flex-start; margin-bottom: 18px; }
        .step:last-child { margin-bottom: 0; }
        .step-number { background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; margin-right: 15px; flex-shrink: 0; }
        .step-content { font-size: 16px; }
        .step-content strong { color: #065f46; }
        .footer { background: #1e293b; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 8px 0; }
        .total-section { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 20px; border: 3px solid #0ea5e9; margin-bottom: 25px; }
        .total-price { font-size: 24px; font-weight: 700; color: #0ea5e9; text-align: right; }
        .important-note { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; border: 2px solid #f59e0b; margin-top: 30px; }
        .important-note p { margin: 0; color: #92400e; font-size: 16px; }
        .quantity-text { color: #64748b; font-size: 14px; margin-bottom: 8px; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>🏖️ Booking Confirmed!</h1>
          <p>Your beach activity is all set</p>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Booking Summary -->
          <div class="booking-card">
            <div class="booking-number">📋 ${booking.booking_number}</div>
            <p><strong>Hi ${booking.customer_name}!</strong> Your booking has been confirmed. Get ready for an amazing experience!</p>
          </div>

          <!-- Activities -->
          <div class="info-section">
            <div class="info-title">🎯 Your Activities</div>
                         ${bookingDetails.map((item: any) => `
               <div class="activity-item">
                 <div class="activity-title">${item.name}</div>
                 <div class="quantity-text">Quantity: ${item.quantity}</div>
                 <div class="activity-price">${formatCurrency(item.price_at_purchase, booking.vendor?.currency || 'EUR')}</div>
               </div>
             `).join('')}
            
            <!-- Total -->
            <div class="total-section">
              <div class="total-price">Total: ${formatCurrency(booking.total_price, booking.vendor?.currency || 'EUR')}</div>
            </div>
          </div>

          <!-- Date & Time -->
          <div class="info-section">
            <div class="info-title">📅 When</div>
            <div class="info-item"><span class="info-label">Date:</span> ${bookingDate}</div>
            <div class="info-item"><span class="info-label">Time:</span> ${bookingTime}</div>
          </div>

          <!-- Vendor Info -->
          <div class="info-section">
            <div class="info-title">🏪 Provider</div>
            <div class="info-item"><span class="info-label">Business:</span> ${booking.vendor?.name || 'Beach Activities'}</div>
            ${booking.vendor?.location ? `<div class="info-item"><span class="info-label">Location:</span> ${booking.vendor.location}</div>` : ''}
          </div>

          <!-- Next Steps -->
          <div class="steps">
            <div class="info-title" style="color: #065f46; border-color: #10b981;">🚀 Next Steps</div>
                         <div class="step">
               <div class="step-number">1</div>
               <div class="step-content">
                 <strong>Arrive 15 minutes early</strong><br>
                 Come to the meeting point a bit early to check in and get ready.
               </div>
             </div>
             <div class="step">
               <div class="step-number">2</div>
               <div class="step-content">
                 <strong>Bring payment (cash or card)</strong><br>
                 This booking is not financially binding. Payment is due at the activity.
               </div>
             </div>
             <div class="step">
               <div class="step-number">3</div>
               <div class="step-content">
                 <strong>Show this confirmation</strong><br>
                 Present your booking number <strong>${booking.booking_number}</strong> when you arrive.
               </div>
             </div>
          </div>

          <!-- Contact Info -->
          ${booking.customer_whatsapp ? `
          <div class="info-section">
            <div class="info-title">📱 Your Contact Details</div>
            <div class="info-item"><span class="info-label">WhatsApp:</span> ${booking.customer_whatsapp}</div>
            ${booking.comments ? `<div class="info-item"><span class="info-label">Special Requests:</span> ${booking.comments}</div>` : ''}
          </div>
          ` : ''}

                     <!-- Important Note -->
           <div class="important-note">
             <p><strong>📋 Important:</strong> This booking is not financially binding. Payment is required at the activity location. Please arrive on time!</p>
           </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>FastLane Bookings</strong></p>
          <p>Making beach activities easy to book 🌊</p>
          <p style="font-size: 12px; opacity: 0.8;">Have questions? Contact the activity provider directly.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email using Resend API
    console.log('📧 Sending email to:', booking.customer_email);
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FastLane Beach Activities <bookings@fast-lane.tech>',
        to: [booking.customer_email],
        subject: `🏖️ Booking Confirmed: ${booking.booking_number} - ${bookingDate}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('❌ Resend API error:', errorData);
      return NextResponse.json(
        { success: false, error: `Failed to send email: ${emailResponse.status}` },
        { status: 500 }
      );
    }

    const emailResult = await emailResponse.json();
    console.log('✅ Customer email sent successfully:', emailResult.id);

    // Send vendor notification email
    let vendorEmailId = null;
    if (vendorEmail) {
      console.log('📧 Sending vendor notification to:', vendorEmail);
      
      // Create vendor-specific email content
      const vendorEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Received - ${booking.booking_number}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; font-weight: 600; }
          .header p { margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .booking-card { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border-left: 6px solid #0ea5e9; }
          .booking-number { font-size: 28px; font-weight: 700; color: #0ea5e9; margin-bottom: 15px; text-align: center; }
          .activity-item { background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
          .activity-title { font-weight: 600; font-size: 18px; color: #1e293b; margin-bottom: 8px; }
          .activity-price { color: #059669; font-weight: 700; font-size: 16px; }
          .info-section { margin-bottom: 35px; }
          .info-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px; border-bottom: 3px solid #0ea5e9; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .info-item { margin-bottom: 12px; font-size: 16px; }
          .info-label { font-weight: 600; color: #64748b; margin-right: 8px; }
          .customer-section { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #10b981; }
          .revenue-section { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #f59e0b; }
          .total-price { font-size: 24px; font-weight: 700; color: #059669; text-align: right; }
          .footer { background: #1e293b; color: white; padding: 30px; text-align: center; }
          .footer p { margin: 8px 0; }
          .admin-link { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin-top: 15px; }
          .admin-link:hover { background: #0284c7; }
          .quantity-text { color: #64748b; font-size: 14px; margin-bottom: 8px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🆕 New Booking Received</h1>
            <p>A customer has booked your activity</p>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Booking Summary -->
            <div class="booking-card">
              <div class="booking-number">📋 ${booking.booking_number}</div>
              <p><strong>Booking Date:</strong> ${bookingDate} at ${booking.booking_time}</p>
            </div>

            <!-- Activities -->
            <div class="info-section">
              <div class="info-title">🎯 Booked Activities</div>
              ${bookingDetails.map((item: any) => `
                <div class="activity-item">
                  <div class="activity-title">${item.name}</div>
                  <div class="quantity-text">Quantity: ${item.quantity}</div>
                  <div class="activity-price">${formatCurrency(item.price_at_purchase, booking.vendor?.currency || 'EUR')}</div>
                </div>
              `).join('')}
            </div>

            <!-- Customer Details -->
            <div class="customer-section">
              <div class="info-title" style="color: #065f46; border-color: #10b981;">👤 Customer Information</div>
              <div class="info-item"><span class="info-label">Name:</span> ${booking.customer_name}</div>
              <div class="info-item"><span class="info-label">Email:</span> ${booking.customer_email}</div>
              ${booking.customer_whatsapp ? `<div class="info-item"><span class="info-label">WhatsApp:</span> ${booking.customer_whatsapp}</div>` : ''}
              ${booking.participant_count > 1 ? `<div class="info-item"><span class="info-label">Participants:</span> ${booking.participant_count}</div>` : ''}
              ${booking.comments ? `<div class="info-item"><span class="info-label">Special Requests:</span> ${booking.comments}</div>` : ''}
            </div>

            <!-- Revenue Information -->
            <div class="revenue-section">
              <div class="info-title" style="color: #92400e; border-color: #f59e0b;">💰 Revenue Details</div>
              <div class="total-price">Total: ${formatCurrency(booking.total_price, booking.vendor?.currency || 'EUR')}</div>
              <p style="margin-top: 15px; color: #92400e; font-size: 14px;">
                <strong>Payment:</strong> Customer will pay at the activity location (not financially binding booking)
              </p>
            </div>

            <!-- Next Steps -->
            <div class="info-section">
              <div class="info-title">✅ Next Steps</div>
              <div style="font-size: 16px; line-height: 1.6;">
                <p>1. <strong>Review the booking</strong> in your admin panel</p>
                <p>2. <strong>Prepare for the activity</strong> on ${bookingDate} at ${booking.booking_time}</p>
                <p>3. <strong>Contact customer</strong> if needed via WhatsApp or email</p>
                <p>4. <strong>Mark as complete</strong> after the activity is finished</p>
              </div>
              
              <div style="text-align: center; margin-top: 25px;">
                <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/admin/bookings" class="admin-link">
                  View in Admin Panel
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>FastLane Business Portal</strong></p>
            <p>Managing your bookings made easy</p>
            <p style="font-size: 12px; opacity: 0.8;">Questions? Contact support or check your admin panel.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      try {
        const vendorEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'FastLane Bookings <bookings@fast-lane.tech>',
            to: [vendorEmail],
            subject: `🆕 New Booking: ${booking.booking_number} - ${bookingDate}`,
            html: vendorEmailHtml,
          }),
        });

        if (vendorEmailResponse.ok) {
          const vendorEmailResult = await vendorEmailResponse.json();
          vendorEmailId = vendorEmailResult.id;
          console.log('✅ Vendor email sent successfully:', vendorEmailId);
        } else {
          const errorData = await vendorEmailResponse.text();
          console.warn('⚠️ Vendor email failed:', errorData);
        }
      } catch (vendorEmailError) {
        console.warn('⚠️ Vendor email error:', vendorEmailError);
      }
    } else {
      console.log('ℹ️ No vendor email found, skipping vendor notification');
    }

    return NextResponse.json({
      success: true,
      message: 'Booking confirmation email sent successfully',
      emailId: emailResult.id,
      vendorEmailId: vendorEmailId
    });

  } catch (error) {
    console.error('❌ Unexpected error in email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 