import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
export const SurveySkipModal = (props) => {
    const { handleOpenModel } = props;
    const navigate = useNavigate();
    const handleYesBtn = () => {
        navigate("/");
    };

    return (
        <div className='w-full h-full absolute top-0 left-0 bg-black bg-opacity-50 backdrop-blur-sm '>
            <div className="bg-blue-500 px-8 pt-8 pb-4 rounded-lg shadow-lg w-80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <button className="absolute top-1 right-2 text-gray-700" onClick={handleOpenModel}>
                   X
                </button>
                <div className="bg-white p-4 rounded-lg text-center m-3">
                    <h1 className="text-3xl font-bold mb-2 text-black">Bỏ qua bài khảo sát</h1>
                    <p className="text-gray-500">Khảo sát này đóng vai trò quan trọng để xác định tình trạng của học sinh, hãy cân nhắc</p>
                </div>
                <div className="flex justify-around mt-4">
                    <button className="bg-green-500 text-white px-5 py-2 rounded-lg flex items-center" onClick={handleYesBtn}>
                        Yes
                    </button>
                    <button className="bg-blue-700 text-white px-5 py-2 rounded-lg" onClick={handleOpenModel}> 
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

SurveySkipModal.propTypes = {
    handleOpenModel: PropTypes.func.isRequired,
};
