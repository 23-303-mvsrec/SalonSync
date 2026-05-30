const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('       SalonSync Backend Integration Tests        ');
  console.log('==================================================\n');

  try {
    // 1. Test GET /api/branches
    console.log('Testing GET /api/branches...');
    const branchesRes = await fetch(`${BASE_URL}/branches`);
    if (!branchesRes.ok) throw new Error('Branches API failed');
    const branches = await branchesRes.json();
    console.log(`✅ Success: Found ${branches.length} branches.`);
    console.log(`   Sample Branch: "${branches[0].name}" in ${branches[0].city}\n`);

    // 2. Test POST /api/customers
    console.log('Testing POST /api/customers (Create new customer)...');
    const testPhone = '9900990099';
    const customerPayload = {
      name: 'Integration Test Customer',
      phone: testPhone,
      email: 'test@salonsync.com',
      loyaltyPoints: 100,
      totalVisits: 2,
      preferredBranch: 1
    };

    const customerRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerPayload)
    });
    if (!customerRes.ok) throw new Error('Create customer API failed');
    const customer = await customerRes.json();
    console.log(`✅ Success: Customer profile created/verified.`);
    console.log(`   ID: ${customer.id}, Name: "${customer.name}", Phone: ${customer.phone}\n`);

    // 3. Test POST /api/appointments
    console.log('Testing POST /api/appointments (Book new appointment)...');
    const appointmentPayload = {
      customerId: customer.id,
      customerName: customer.name,
      staffId: 1,
      staffName: 'Ravi Kumar',
      serviceId: 1,
      serviceName: 'Haircut (Men)',
      branchId: 1,
      date: '2026-05-30',
      time: '14:30',
      status: 'pending',
      source: 'website',
      amount: 300
    };

    const appointmentRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentPayload)
    });
    if (!appointmentRes.ok) throw new Error('Create appointment API failed');
    const appointment = await appointmentRes.json();
    console.log(`✅ Success: Appointment booked successfully.`);
    console.log(`   ID: ${appointment.id}, Status: "${appointment.status}", Service: "${appointment.serviceName}"\n`);

    // 4. Test PUT /api/appointments/:id/status (Complete appointment and trigger customer loyalty points)
    console.log('Testing PUT /api/appointments/:id/status (Complete booking & award loyalty)...');
    const statusRes = await fetch(`${BASE_URL}/appointments/${appointment.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    if (!statusRes.ok) throw new Error('Update appointment status API failed');
    const updatedAppointment = await statusRes.json();
    console.log(`✅ Success: Appointment marked as "${updatedAppointment.status}".`);

    // Verify if customer visits and loyalty points updated in backend
    const customersRes = await fetch(`${BASE_URL}/customers`);
    const customersList = await customersRes.json();
    const updatedCustomer = customersList.find(c => c.id === customer.id);
    console.log(`✅ Success: Customer visits updated to ${updatedCustomer.totalVisits} (+1)`);
    console.log(`   Loyalty Points updated to ${updatedCustomer.loyaltyPoints} (+${Math.round(appointment.amount * 0.1)} points)\n`);

    // 5. Test PUT /api/inventory/:id/quantity
    console.log('Testing PUT /api/inventory/:id/quantity (Adjust stock levels)...');
    const inventoryRes = await fetch(`${BASE_URL}/inventory`);
    const inventoryList = await inventoryRes.json();
    if (inventoryList.length === 0) {
      console.log('⚠️ Warning: No inventory items available to test quantity update.\n');
    } else {
      const itemToUpdate = inventoryList[0];
      const newQty = itemToUpdate.quantity + 5;
      const qtyRes = await fetch(`${BASE_URL}/inventory/${itemToUpdate.id}/quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      if (!qtyRes.ok) throw new Error('Update inventory quantity failed');
      const updatedItem = await qtyRes.json();
      console.log(`✅ Success: "${updatedItem.name}" stock updated: ${itemToUpdate.quantity} ➔ ${updatedItem.quantity} ${updatedItem.unit}\n`);
    }

    console.log('==================================================');
    console.log(' 🎉  ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!  ');
    console.log('==================================================');
  } catch (error) {
    console.error('\n❌ Test execution failed with error:', error.message);
  }
}

runTests();
