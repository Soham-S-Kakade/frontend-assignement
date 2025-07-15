import React, { useRef, useEffect } from 'react';

const CanvasChart = ({ data, width = 400, height = 200, type = 'line' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set up canvas for high DPI displays
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) return;

    // Set up canvas
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#3b82f6';

    const padding = {
      left: 60,   // More space for y-axis labels
      right: 20,
      top: 20,
      bottom: 50  // More space for x-axis labels
    };

    const chartWidth = width - (padding.left + padding.right);
    const chartHeight = height - (padding.top + padding.bottom);

    // Find min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid and background
    drawGrid(ctx, padding, chartWidth, chartHeight, 5);

    // Draw chart based on type
    if (type === 'line') {
      drawLineChart(ctx, data, padding, chartWidth, chartHeight, minValue, valueRange);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, padding, chartWidth, chartHeight, minValue, valueRange);
    }

    // Draw axes and labels
    drawAxes(ctx, padding, chartWidth, chartHeight);
    drawLabels(ctx, data, padding, chartWidth, chartHeight, minValue, maxValue);

  }, [data, width, height, type]);

  const drawGrid = (ctx, padding, chartWidth, chartHeight, gridLines) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i * chartHeight) / gridLines;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= data.length - 1; i++) {
      const x = padding.left + (i * chartWidth) / (data.length - 1);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }
  };

  const drawAxes = (ctx, padding, chartWidth, chartHeight) => {
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Add axis titles
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';

    // X-axis title
    ctx.fillText('Date', width / 2, height - 10);

    // Y-axis title
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('AQI Value', 0, 0);
    ctx.restore();
  };

  const drawLineChart = (ctx, data, padding, chartWidth, chartHeight, minValue, valueRange) => {
    // Draw line
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding.left + (index * chartWidth) / (data.length - 1);
      const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw gradient under the line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    ctx.fillStyle = gradient;
    ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw data points
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;

    data.forEach((point, index) => {
      const x = padding.left + (index * chartWidth) / (data.length - 1);
      const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  };

  const drawBarChart = (ctx, data, padding, chartWidth, chartHeight, minValue, valueRange) => {
    const barWidth = chartWidth / data.length * 0.7; // Slightly thinner bars
    const barSpacing = chartWidth / data.length * 0.15; // Add spacing between bars

    data.forEach((point, index) => {
      const x = padding.left + (index * chartWidth) / data.length + barSpacing;
      const barHeight = ((point.value - minValue) / valueRange) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#3b82f6');  // Blue top
      gradient.addColorStop(1, '#60a5fa');  // Lighter blue bottom
      ctx.fillStyle = gradient;

      // Draw bar with rounded corners
      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.lineTo(x, y + barHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Add value label on top of each bar
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(point.value), x + barWidth / 2, y - 10);
    });
  };

  const drawLabels = (ctx, data, padding, chartWidth, chartHeight, minValue, maxValue) => {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui';

    // X-axis labels
    ctx.textAlign = 'center';
    data.forEach((point, index) => {
      const x = padding.left + (index * chartWidth) / (data.length - 1);
      const y = height - padding.bottom + 25;

      // Format date to be more compact
      const date = new Date(point.label);
      const formattedDate = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      ctx.fillText(formattedDate, x, y);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (maxValue - minValue) * (1 - i / 5);
      const y = padding.top + (i * chartHeight) / 5;
      ctx.fillText(Math.round(value), padding.left - 10, y);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: '12px',
        backgroundColor: '#ffffff'
      }}
    />
  );
};

export default CanvasChart;
