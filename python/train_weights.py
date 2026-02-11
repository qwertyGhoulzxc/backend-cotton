import sys
import json
import os
import pandas as pd
from fsrs_optimizer import Optimizer

def main():
    temp_filename = "./revlog.csv"

    GLOBAL_DEFAULT_V6 = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729]

    try:
        if len(sys.argv) < 2:
            raise ValueError("No csv file path")
                    
        df = pd.read_csv(sys.argv[1])
        df.columns = df.columns.str.strip()
        df.to_csv(temp_filename, index=False)
        
        opt = Optimizer()
        opt.create_time_series(timezone='UTC', revlog_start_date="2000-01-01", next_day_starts_at=4)
        opt.define_model()
        
        method = "default"
        
        try:
            opt.initialize_parameters()
            method = "initialized"
            
            # Training amount of logs
            if len(df) >= 400:
                opt.train(lr=0.01, n_epoch=5, verbose=False)
                method = "trained"
        except Exception:
            pass

        weights = None
        
        if method == "trained" and hasattr(opt, 'model') and hasattr(opt.model, 'w'):
            weights = [float(x) for x in opt.model.w.view(-1).tolist()]
        elif hasattr(opt, 'init_w'):
            weights = [float(x) for x in opt.init_w]
        
        final_weights = weights[:17] if weights else GLOBAL_DEFAULT_V6
        
        print(json.dumps({
            "success": True, 
            "weights": [round(x, 4) for x in final_weights],
            "method": method,
            "count": len(df)
        }))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    main()