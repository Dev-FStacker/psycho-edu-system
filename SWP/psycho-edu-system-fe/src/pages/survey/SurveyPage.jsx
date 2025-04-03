import { useState } from "react";
import { SurveySkipModal } from "../../components/Modal/SurveySkipModal";
import { SurveyStartModal } from "../../components/Modal/SurveyStartModal";
import { useNavigate } from "react-router-dom";

const Survey = () => {
    const [modelSkipOpen, setModelSkipOpen] = useState(false);
    const [modelStartOpen, setModelStartOpen] = useState(false);
    const [account, setAccount] = useState(false);
    const navigate = useNavigate();
    const handleOpenSkipModel = () => {
      setModelSkipOpen(!modelSkipOpen);
    };
    const handleOpenStartModel = () => {
      setModelStartOpen(!modelStartOpen);
    };

    const handleStartSurvey = () => {
      if(!account){
        handleOpenStartModel();
      }else{
        navigate("/Q&A-Survey");
      }
    };
    return (
      <div className="h-screen text-white text-center grid bg-cover bg-center bg-no-repeat bg-mental-health-banner content-end relative bg-opacity-50 backdrop-blur-sm ">
        <div className="col-start-1 row-start-1 mx-auto my-auto max-w-4xl px-4">
          <button className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-2xl py-4 px-12 mb-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
            onClick={handleStartSurvey}
          >
            Bắt đầu khảo sát
          </button>
          <div className="mt-4 mb-8" onClick={handleOpenSkipModel}>
            <a href="#" className="text-black underline font-normal italic" >Bỏ qua khảo sát</a>
          </div>
        </div>
        {modelSkipOpen && (
          <SurveySkipModal handleOpenModel={handleOpenSkipModel}/>
        )}

        {modelStartOpen && (
          <SurveyStartModal handleOpenModel={handleOpenStartModel}/>
        )}
      </div>
    );
  };
  export default Survey;