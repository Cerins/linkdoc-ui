function apply(apply: boolean | string | null | undefined, acceptStyle: string, rejectStyle?: string) {
    if(apply) return acceptStyle;
    return rejectStyle ?? '';
}

export {
    apply
}
    
