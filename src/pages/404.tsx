import { Link } from "react-router-dom";


const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className=" w-full text-center">
              
                <div className="sm p-8 md:p-12">
             
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-50 mb-4">
                            <svg
                                className="w-12 h-12 md:w-16 md:h-16 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
                        404
                    </h1>

                    
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-3">
                        Page Not Found
                    </h2>

                    
                    <p className="text-base md:text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved. 
                        Let's get you back on track.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                       
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Go Home
                        </Link>

                    
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer transition-colors duration-200"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Go Back
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-gray-500">
                    Need help? Contact support or check the{" "}
                    <Link to="/" className="text-blue-500 hover:text-blue-600 underline">
                        dashboard
                    </Link>
                </p>
                </div>

           
            </div>
        </div>
    );
};

export default NotFound;