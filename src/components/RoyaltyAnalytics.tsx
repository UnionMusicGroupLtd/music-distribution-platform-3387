import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface RoyaltyAnalyticsProps {
  royalties: any[];
  tracks: any[];
}

export const RoyaltyAnalytics = ({ royalties, tracks }: RoyaltyAnalyticsProps) => {
  // Calculate country breakdown (revenue only)
  const getCountryBreakdown = () => {
    const countryData = royalties.reduce((acc: any, r: any) => {
      const country = r.country || 'Unknown';
      if (!acc[country]) {
        acc[country] = { revenue: 0 };
      }
      acc[country].revenue += r.revenue || 0;
      return acc;
    }, {});

    return Object.entries(countryData)
      .map(([country, data]: any) => ({
        country,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 countries
  };

  // Calculate track performance (revenue only)
  const getTrackPerformance = () => {
    const trackData = royalties.reduce((acc: any, r: any) => {
      // Use track_title directly from royalty data first, fallback to track lookup
      const trackTitle = r.track_title || '';
      
      // Try to find track by ID if track_id exists
      let finalTitle = trackTitle;
      let album = '';
      
      if (r.track_id) {
        const track = tracks.find((t: any) => t._row_id === r.track_id);
        if (track?.title) {
          finalTitle = track.title;
          album = track.album_name || '';
        }
      }
      
      // If still no title, use the royalty's track_title or fallback to "Unknown Track"
      if (!finalTitle) {
        finalTitle = r.track_title || 'Unknown Track';
      }
      
      // Use a unique key to handle same track titles from different sources
      const trackKey = r.track_id || `manual-${finalTitle}-${r.platform || 'unknown'}`;
      
      if (!acc[trackKey]) {
        acc[trackKey] = {
          title: finalTitle,
          album: album,
          revenue: 0
        };
      }
      acc[trackKey].revenue += r.revenue || 0;
      return acc;
    }, {});

    return Object.values(trackData)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 tracks
  };

  // Monthly revenue trend data (revenue only)
  const getMonthlyTrend = () => {
    const monthlyData = royalties.reduce((acc: any, r: any) => {
      const period = r.period || 'Unknown';
      if (!acc[period]) {
        acc[period] = { revenue: 0 };
      }
      acc[period].revenue += r.revenue || 0;
      return acc;
    }, {});

    return Object.entries(monthlyData)
      .map(([period, data]: any) => ({
        period,
        revenue: data.revenue
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  const countryData = getCountryBreakdown();
  const trackData = getTrackPerformance();
  const monthlyTrend = getMonthlyTrend();

  if (royalties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-300">No analytics data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Country/Region Analysis - Revenue Only */}
      <Card className="bg-slate-900/50 border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Geographic Revenue Distribution</h3>
        {countryData.length > 0 ? (
          <>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3b0764" />
                  <XAxis dataKey="country" stroke="#a855f7" fontSize={12} />
                  <YAxis stroke="#a855f7" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #7c3aed', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ec4899" name="Revenue by Country" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryData.map((country: any) => (
                <Card key={country.country} className="bg-slate-800/50 border-purple-500/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{country.country}</h4>
                    <Badge className="bg-pink-500/20 text-pink-300 text-xs">
                      {((country.revenue / royalties.reduce((sum: number, r: any) => sum + r.revenue, 0)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-400">Revenue:</span>
                      <span className="text-green-400 font-medium">${country.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <p className="text-purple-300 text-center py-4">No geographic data available</p>
        )}
      </Card>

      {/* Track Performance - Revenue Only */}
      <Card className="bg-slate-900/50 border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Tracks by Revenue</h3>
        <div className="space-y-3">
          {trackData.map((track: any, index: number) => (
            <Card key={track.title} className="bg-slate-800/50 border-purple-500/10 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                    <h4 className="text-white font-medium">{track.title}</h4>
                  </div>
                  {track.album && (
                    <p className="text-sm text-purple-400 mb-2">{track.album}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${track.revenue.toFixed(2)}</div>
                  <div className="text-xs text-purple-400">Total Revenue</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Monthly Revenue Trends */}
      {monthlyTrend.length > 1 && (
        <Card className="bg-slate-900/50 border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3b0764" />
              <XAxis dataKey="period" stroke="#a855f7" fontSize={12} />
              <YAxis stroke="#a855f7" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #7c3aed', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default RoyaltyAnalytics;
