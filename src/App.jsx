// ... 前半部分は同じ

export default function App() {
  const [age, setAge] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [recommendedDepartment, setRecommendedDepartment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customSymptoms, setCustomSymptoms] = useState({});

  const handleAgeSelect = (ageData) => {
    console.log('Selected age data:', ageData);
    setAge(ageData);
  };

  // ... 残りの実装は同じ

  const handleAnalyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0 || !age) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptomsWithClaude(selectedSymptoms, age);
      setRecommendedDepartment(result);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setRecommendedDepartment({
        recommendedDepartment: '小児科',
        alternativeDepartments: [],
        urgencyLevel: 2,
        recommendations: ['お近くの病院を受診してください'],
        warningSigns: ['症状が急に悪くなったとき'],
        preventiveMeasures: ['ゆっくり休んでください']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ... 残りの実装は同じ
}