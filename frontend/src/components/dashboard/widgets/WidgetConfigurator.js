import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ColorPicker from '../../common/ColorPicker';
import CodeEditor from '../../common/CodeEditor';
import LoadingSpinner from '../../common/LoadingSpinner';

const WidgetConfigurator = ({ widgetConfig, onSave, isLoading }) => {
  const [config, setConfig] = useState({
    position: 'bottom-right',
    theme: 'auto',
    features: {
      contrast: true,
      fontSize: true,
      readingGuide: true,
      textToSpeech: true,
      keyboardNavigation: true
    },
    featureOrder: ['contrast', 'fontSize', 'readingGuide', 'textToSpeech', 'keyboardNavigation'],
    customCss: '',
    ...widgetConfig
  });

  // Initialize feature order if not present
  useEffect(() => {
    if (widgetConfig && !widgetConfig.featureOrder) {
      setConfig(prev => ({
        ...prev,
        featureOrder: Object.keys(prev.features).filter(key => prev.features[key])
      }));
    }
  }, [widgetConfig]);

  const handlePositionChange = (position) => {
    setConfig({ ...config, position });
  };

  const handleThemeChange = (theme) => {
    setConfig({ ...config, theme });
  };

  const handleFeatureToggle = (feature) => {
    const newFeatures = {
      ...config.features,
      [feature]: !config.features[feature]
    };
    
    // Update feature order if feature is enabled
    let newFeatureOrder = [...config.featureOrder];
    
    if (newFeatures[feature] && !newFeatureOrder.includes(feature)) {
      newFeatureOrder.push(feature);
    } else if (!newFeatures[feature]) {
      newFeatureOrder = newFeatureOrder.filter(f => f !== feature);
    }
    
    setConfig({
      ...config,
      features: newFeatures,
      featureOrder: newFeatureOrder
    });
  };

  const handleCssChange = (customCss) => {
    setConfig({ ...config, customCss });
  };

  const handleDragEnd = (result) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const items = Array.from(config.featureOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setConfig({ ...config, featureOrder: items });
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="bg-white shadow sm:rounded-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Widget Configuration</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Position Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Widget Position</label>
            <div className="grid grid-cols-2 gap-4">
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(position => (
                <button
                  key={position}
                  type="button"
                  onClick={() => handlePositionChange(position)}
                  className={`
                    p-4 border rounded-md flex items-center justify-center
                    ${config.position === position ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-300 text-gray-700'}
                  `}
                >
                  {position.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Theme Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex space-x-4">
              {['light', 'dark', 'auto'].map(theme => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleThemeChange(theme)}
                  className={`
                    px-4 py-2 border rounded-md
                    ${config.theme === theme ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-300 text-gray-700'}
                  `}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Features Enabled */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enabled Features</label>
            <div className="space-y-2">
              {Object.entries(config.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`feature-${feature}`}
                    checked={enabled}
                    onChange={() => handleFeatureToggle(feature)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`feature-${feature}`} className="ml-2 text-gray-700">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Feature Order */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Feature Order (Drag to reorder)</label>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="features">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="border border-gray-300 rounded-md p-2"
                  >
                    {config.featureOrder.filter(f => config.features[f]).map((feature, index) => (
                      <Draggable key={feature} draggableId={feature} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 mb-2 bg-gray-50 rounded border border-gray-200 flex items-center"
                          >
                            <span className="mr-2">☰</span>
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          
          {/* Custom CSS */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS (Optional)</label>
            <CodeEditor
              language="css"
              value={config.customCss || ''}
              onChange={handleCssChange}
              height="200px"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add custom CSS to style the widget. This will be included in the widget's stylesheet.
            </p>
          </div>
          
          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="border border-gray-300 rounded-md h-64 relative overflow-hidden bg-gray-100">
              <div className={`absolute ${config.position.replace('-', ' ').replace('top', 'top-4').replace('bottom', 'bottom-4').replace('left', 'left-4').replace('right', 'right-4')}`}>
                <button className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WidgetConfigurator;