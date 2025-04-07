const Visitor = require('../models/Visitor');
const moment = require('moment');

exports.getVisitorStatistics = async (req, res) => {
  try {
    // Get today's date at start of day
    const today = moment().startOf('day');
    
    // Calculate week start and end dates
    const weekStart = moment().startOf('week');
    const weekEnd = moment().endOf('week');
    
    // Get total visitors today
    const totalVisitorsToday = await Visitor.countDocuments({
      createdAt: { $gte: today.toDate() }
    });
    
    // Get total appointments scheduled for today
    const todayAppointments = await Visitor.countDocuments({
      appointmentDate: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      },
      status: 'scheduled'  // Make sure this matches your enum values in Visitor model
    });
    
    // Get currently checked in visitors
    const checkedIn = await Visitor.countDocuments({
      status: 'checked-in',  // Make sure this matches your enum values in Visitor model
      checkOutTime: null
    });
    
    // Get visitor counts for each day of the current week
    const weeklyVisitors = await Visitor.aggregate([
      {
        $match: {
          createdAt: {
            $gte: weekStart.toDate(),
            $lte: weekEnd.toDate()
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Generate array of all days in the week
    const weeklyLabels = [];
    const weeklyData = [];
    
    for (let i = 0; i < 7; i++) {
      const day = moment(weekStart).add(i, 'days');
      const dayStr = day.format('YYYY-MM-DD');
      weeklyLabels.push(day.format('ddd'));
      
      // Find count for this day
      const dayData = weeklyVisitors.find(item => item._id === dayStr);
      weeklyData.push(dayData ? dayData.count : 0);
    }
    
    // Get visitor type stats
    const visitorTypeData = await Visitor.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format visitor type data based on your Visitor model's enum values
    const visitorTypes = [0, 0, 0, 0]; // [scheduled, walk-in, event, vendor]
    
    visitorTypeData.forEach(type => {
      switch(type._id) {
        case 'scheduled':
          visitorTypes[0] = type.count;
          break;
        case 'walk-in':
          visitorTypes[1] = type.count;
          break;
        case 'event':
          visitorTypes[2] = type.count;
          break;
        case 'vendor':
          visitorTypes[3] = type.count;
          break;
      }
    });
    
    // Return formatted statistics
    return res.status(200).json({
      totalVisitors: totalVisitorsToday,
      todayAppointments,
      checkedIn,
      weeklyLabels,
      weeklyData,
      visitorTypes
    });
    
  } catch (error) {
    console.error('Error getting visitor statistics:', error);
    return res.status(500).json({ error: 'Server error while retrieving statistics' });
  }
};