package hollow;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;
import java.io.FileWriter;
import java.io.IOException;

public class Hollow {
	public static void main(String[] args) throws IOException {
	File myObj = new File("test.txt");
    Scanner myReader = new Scanner(myObj);
    
    
    int arr[][][] = new int[300][300][300];
    while (myReader.hasNextLine()) {
        String data = myReader.nextLine();
        int x = Integer.parseInt(data.substring(0,data.indexOf(",")));
        data = data.substring(data.indexOf(",")+2);
        int y = Integer.parseInt(data.substring(0,data.indexOf(",")));
        data = data.substring(data.indexOf(",")+2);
        int z = Integer.parseInt(data);
        System.out.println(x+" "+y+" "+z);
        arr[x][y][z] = 1;
      }
      myReader.close();
      
      FileWriter myWriter = new FileWriter("testOut2.txt");
      myWriter.append("fuck");
      for (int i=0; i<300; i++)
      {
    	  for (int j=0; j<300; j++)
          {
    		  for (int k=0; k<300; k++)
    	      {
    	    	  if (arr[i][j][k] == 1)
    	    	  {
    	    		  if(i == 0 || i == 300 ||
    	    			 j == 0 || j == 300 ||
    	    			 k == 0 || k == 300) {
    	    			  myWriter.append(i+", "+j+", "+k+"\n");
    	    		  }
    	    		  else {
    	    			  if(arr[i+1][j][k] != 1 ||
	     	    			 arr[i-1][j][k] != 1 ||
	     	    			 arr[i][j+1][k] != 1 ||
	     	    	    	 arr[i][j-1][k] != 1 ||
	     	    			 arr[i][j][k+1] != 1 ||
	     	    			 arr[i][j][k-1] != 1) {
    	     	    			  myWriter.append(i+", "+j+", "+k+"\n");  
    	    			  }
    	    		  }
    	    	  }
    	      }
          }
      }
      myWriter.close();
      
     
      
	}
}
