# Prusa Mini Silicone Bed Leveling Mod

> Sometimes Mesh Bed Leveling just isn't enough.
> 
Instead of relying on a fixed plane which depends on your Y-carriage being perfectly level, the idea is to make it so the heated bed floats on the Y-carriage and allow for very fine adjustments. Compared to the MK3 Nylock Mod which uses springs which may deform over time due to drastic temperature changes and pressure, this mod leverages the properties of high-temp silicone to adjust the height more permanently.

![enter image description here](https://i.imgur.com/b9tImfk.jpg)

---

## Benefits & drawbacks

### Pros
- Single fixed reference point

### Cons
- Possibility of needing readjustment (no reports yet) 


## Requirements
-   Length of 3mm ID 7-8mm OD high-temperature silicone tubing (can be found in car parts shops)
	- [Amazon](https://www.amazon.com/gp/product/B01CTXVJY6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1) (B01CTXVJY6)
	- [PL source](https://fmic.pl/laczniki-silikonowe/193-5923-przewod-podcisnienia-3mm-vacuum.html)
-   8 M3  **low-profile**  nylon locknuts
	- [Amazon](https://www.amazon.com/gp/product/B003Z6VHE4/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1) (B003Z6VHE4)
-   8 M3x16 flat head countersunk  **Torx**  screws (hex will not work)
	- [PL source](https://inoxprostal.pl/din-965-tx-a2-wkrety-metryczne-nierdzewne-plasko-stozkowe-na-torx/3312-din-965-tx-a2-m3x16-mm-wkret-metr-plasko-stozkowy-torx.html)
-   3mm combination wrench
	- [Printable wrench](https://www.thingiverse.com/thing:2440589)
-   Computer with Pronterface or OctoPrint
	- [Pronterface](https://www.pronterface.com/)
	- [OctoPrint](https://octoprint.org/)
-   Micro USB cable
-   Torx wrench or driver (recommend wrench for precision)
-   Tube cutting jig
	- [STL](https://github.com/PaulGameDev/PrusaMK3_Silicone_Leveling) 
-   Razorblade or sharp knife

## Installation/Setup Procedure

1.  Make sure your X-Z assembly is square with the Y assembly. If you can't get it right, try shimming.
2.  Power off the printer.
3.  Cut 8 pieces of silicone tubing using the jig linked above. Or if you have a steady hand, cut 8 x 10mm pieces without the jig.

![enter image description here](https://i.imgur.com/xvDJFsO.jpg)
![enter image description here](https://i.imgur.com/SrOH7dc.jpg)

4.  Remove printbed
5.  Remove heatbed. Follow the reverse order as show in the [official MK3 documentation](https://help.prusa3d.com/en/guide/7-heatbed-psu-assembly-black-psu_31936#32920).

![enter image description here](https://i.imgur.com/ayQvKFn.png)

6.  Remove the 8 3mm screws and spacers along the outside of the Y carriage (leave the center screw & spacer)

![enter image description here](https://i.imgur.com/DbVWOTS.jpg)
![enter image description here](https://i.imgur.com/yH681cV.jpg)
![enter image description here](https://i.imgur.com/9xbBh58.jpg)

7.  Replace the heatbed while placing the cut silicone tubing in place of the previous metal spacers (between the carriage and the bed). Place the 8 Torx screws through the heatbed, silicone tube and carriage to hold it all together.

![enter image description here](https://i.imgur.com/c1Hzzbu.jpg)
![enter image description here](https://i.imgur.com/zLXSj0W.jpg)

8.  Carefully apply pressure to a corner Torx screw to compress the silicone tube and loosely attach a low-profile 3mm nut.
9.  Go to the opposite corner and do the same. Now the other two corners and then the remaining screws.  Be very careful here, you can break the heatbed if it bends too much.
10.  Start tightening the screws back into place until approximately 6mm between the Y carriage and the heatbed. ONE TURN EACH! This takes a while but ensures you get it back on level and without unnecessarily stressing the bed. Follow the order as show in the [official MK3 documentation](https://help.prusa3d.com/en/guide/7-heatbed-psu-assembly-black-psu_31936#32920).

![enter image description here](https://i.imgur.com/ayQvKFn.png)
![enter image description here](https://i.imgur.com/Lo9Id0w.jpg)

11.  Now screw in the center screw until tight.

![enter image description here](https://i.imgur.com/sZoehVA.jpg)

## Leveling Procedure
1.  Power on the printer
2.  Plug in USB-B from computer to the printer
3.  Fire up Pronterface or OctoPrint and hit the connect to printer button
4.  In the bottom right text box, enter the following GCode followed by the enter key. `M104 S170` set extruder temp for bed leveling
    
    M140 S60 ; set bed temp  
    M109 R170 ; wait for bed leveling temp  
    M190 S60 ; wait for bed temp
    
5.  Once the temperature has reached the target, input the following GCode
    
    G28 ; home all without mesh bed level  
    G29 ; mesh bed leveling
    
6.  Now, wait for the mesh leveling to complete.
	You should see output something like this:
	|            |           |            |            |
	|--------|--------|--------|--------|
	| \-0.021 | \+0.021  | \-0.024 | \-0.004 |
	| \-0.021 | \+0.023  | \+0      | \-0.023 |
	| \+0.01   | \-0.047 | \-0.064 | \-0.056 |
	| \+0.002  | \+0.015  | \-0.057 | \-0.015 |

8.  Copy the results and paste them into the [spreadsheet (B3:E6) here](https://docs.google.com/spreadsheets/d/1iDbB3aLflnnJze0St2_mDPMZZynlTgUOanb5mXP_Qng/edit?usp=sharing) (make a copy first)  
    **You might need to remove any `+` signs**
9.  Copy the output results (A12:H18) and paste them into the website here:  [https://pcboy.github.io/g81_relative/](https://pcboy.github.io/g81_relative/)
10.  Follow the instructions for which screws to turn and how far
11.  Repeat steps 5-9 until the numbers from the results section on the website are no more than .02 difference between your biggest and smallest numbers. Ideally 0.
12.  Run Z calibration again resetting the current value. You've just changed the height of your print surface and you don't want to crash the nozzle into it.
13.  Spend loads of quality time printing the bottom 2mm of Benchy and getting that live-z value perfect.

## Notes
-   Why Torx screws? Because the Mini's heatbed screw holes are not as deep as the Mk3's. Hex screws will sit proud of the bed.
-   Why low-profile locknuts? Actually the only area the low-profile locknut is required on is the top center mount point. This allows clearing the Y-axis motor mount.
-   If you cannot find low-profile locknuts, you can use regular ones, but you will need 18mm 3m Torx screws. However, the top center point REQUIRES a 16mm Torx screw and low-profile locknut. If you cannot find a single low-profile locknut, you can sand one down to at least 3mm height.

_I take no responsibility or liability, for any damages including, but not limited to indirect or consequential and/or loss of life._

## Credit
- Thanks to @Paul_GD for the original idea ([prusa3d Discord](https://discord.com/invite/ArjqkbG))
- Thanks to [@robee](https://forum.prusaprinters.org/forum/profile/robee/) for the detailed pictures
