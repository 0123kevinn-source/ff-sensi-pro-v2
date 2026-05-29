const REF = 401;

export function calcSensitivity(base, dpi) 
{
    return Math.min(
        100,
        Math.max(
            0,
            Math.round((base * REF ) / dpi) 
        )
    );
}   
    