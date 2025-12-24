const Spinner = ({ size = 'md', color = 'indigo' }) => {
    // Define size classes
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
    };
    
    // Define color classes
    const colorClasses = {
        indigo: 'bg-indigo-500',
        green: 'bg-green-500',
        white: 'bg-white',
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;
    const currentColor = colorClasses[color] || colorClasses.indigo;

    return (
        <div className="flex items-center justify-center space-x-1">
            {/* The main container for the spinning effect */}
            <div className={`flex items-center justify-between ${currentSize}`}>
                <div 
                    className={`rounded-full ${currentColor} ${currentSize} animate-chase`} 
                    style={{ animationDelay: '-0.32s' }}
                />
                <div 
                    className={`rounded-full ${currentColor} ${currentSize} animate-chase`} 
                    style={{ animationDelay: '-0.16s' }}
                />
                <div 
                    className={`rounded-full ${currentColor} ${currentSize} animate-chase`} 
                />
            </div>
        </div>
    );
};

export default Spinner;