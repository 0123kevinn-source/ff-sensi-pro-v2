export function getSensitivityColor(value)
{
    if (value >= 80) return "#4CAF50";
    if (value >= 60) return "#FFEB3B";
    if (value >= 40) return "#FF9800";
    return "#F44336";
    }