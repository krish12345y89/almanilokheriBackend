import { User } from "../dataBase/models/user.js";
import { DailyDeviceRecordModel } from "../dataBase/models/deviceRecord.js";
const getDaysInMonth = (year, month) => new Date(year, new Date(Date.parse(month + " 1, " + year)).getMonth() + 1, 0).getDate();
export const Dashboard = async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const currentMonth = now.toLocaleString("en-US", { month: "short" });
        const [userStats, records] = await Promise.all([
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        AllUser: { $sum: 1 },
                        ActiveUser: {
                            $sum: { $cond: [{ $eq: ["$status", "Approve"] }, 1, 0] },
                        },
                        UnVerifiedUser: {
                            $sum: { $cond: [{ $eq: ["$status", "NotApprove"] }, 1, 0] },
                        },
                        BlockUser: {
                            $sum: { $cond: [{ $eq: ["$status", "Block"] }, 1, 0] },
                        },
                        PendingUser: {
                            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                        },
                    },
                },
            ]),
            DailyDeviceRecordModel.find({ month: currentMonth, year }),
        ]);
        const totalCount = records.reduce((sum, record) => sum + Number(record.count), 0);
        const averageCount = (totalCount / now.getDate()).toFixed(2);
        res.json({ UserData: userStats[0] || {}, Activity: { avg: averageCount } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const processData = (sample, id, color) => ({
    id,
    color,
    data: ["1-5", "6-10", "11-15", "16-20", "21-25", "25-31"].map((range, i) => ({
        x: range,
        y: Math.max(...sample
            .filter((entry) => {
            const day = parseInt(entry.day);
            return day >= i * 5 + 1 && day <= (i + 1) * 5;
        })
            .map((entry) => parseInt(entry.count)), 0),
    })),
});
export const monthsTrafficData = async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        const monthIndices = [-2, -1, 0].map((offset) => (now.getMonth() + offset + 12) % 12);
        const monthYearPairs = monthIndices.map((i) => ({
            month: months[i],
            year: i > now.getMonth() ? year - 1 : year,
        }));
        const rawData = await Promise.all(monthYearPairs.map((pair) => DailyDeviceRecordModel.find(pair).lean()));
        const trafficData = rawData.map((data, i) => processData(data, `${monthYearPairs[i].month}-${monthYearPairs[i].year}`, ["#ea03ff", "#00ffbb", "#0c18ff"][i]));
        res.json({ Traffic: trafficData });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const OneMonthTrafficData = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year)
            return res.status(400).json({ error: "Month and year are required" });
        const sample = await DailyDeviceRecordModel.find({ month, year }).lean();
        const total = sample.reduce((sum, record) => sum + Number(record.count), 0);
        const average = (total / getDaysInMonth(Number(year), month)).toFixed(3);
        const emptyData = [
            {
                id: `${month}-${year}`,
                color: "#00ffbb",
                data: Array.from({ length: getDaysInMonth(Number(year), month) }, (_, i) => ({
                    x: (i + 1).toString(),
                    y: sample.find((entry) => parseInt(entry.day) === i + 1)?.count || 0,
                })),
            },
        ];
        res.json({ Average: Number(average), Traffic: emptyData, Total: total });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
