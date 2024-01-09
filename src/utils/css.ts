/**
 * Applies the specified style based on the provided condition.
 * This is done to not write ternary operators in the JSX.
 * @param apply - The condition to determine whether to apply the style.
 * @param acceptStyle - The style to apply when the condition is true.
 * @param rejectStyle - The style to apply when the condition is false. Defaults to an empty string.
 * @returns The applied style.
 */
function apply(apply: boolean | string | null | undefined, acceptStyle: string, rejectStyle?: string) {
    if(apply) return acceptStyle;
    return rejectStyle ?? '';
}

export {
    apply
}
    
