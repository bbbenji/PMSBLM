# Prusa Mini Silicone Bed Leveling Mod

> Sometimes Mesh Bed Leveling just isn't enough.

Instead of relying on a fixed plane which depends on your Y-carriage being perfectly level, the idea is to make it so the heated bed floats on the Y-carriage and allow for very fine adjustments. Compared to other mods that rely on springs which may deform over time due to drastic temperature changes and pressure, this mod leverages the properties of high-temp silicone to adjust the height more permanently. Due to the Y-carriage not having threaded holes for mounting the heated bed, the i3 nylock mod is not possible.

<a href="/images/pmsblm-full-assembly.jpeg"><img src="/images/pmsblm-full-assembly.jpeg" width="100%"></a>

---

## Table of contents

- [Prusa Mini Silicone Bed Leveling Mod](#prusa-mini-silicone-bed-leveling-mod)
	- [Table of contents](#table-of-contents)
	- [Benefits & drawbacks](#benefits--drawbacks)
		- [Pros](#pros)
		- [Cons](#cons)
	- [Requirements](#requirements)
	- [Installation/Setup Procedure](#installationsetup-procedure)
	- [Leveling Procedure](#leveling-procedure)
	- [Notes](#notes)
	- [Credit](#credit)


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
	- Search for product code `AXA1052`, they show up on a number of hobbyist/RC sites.
-   8 M3x16 flat head countersunk  **Torx**  screws (hex *might* not work)
	- [Amazon](https://smile.amazon.com/gp/product/B01DEUBWMM/) (B01DEUBWMM)
	- [PL source](https://inoxprostal.pl/din-965-tx-a2-wkrety-metryczne-nierdzewne-plasko-stozkowe-na-torx/3312-din-965-tx-a2-m3x16-mm-wkret-metr-plasko-stozkowy-torx.html)
	- These are DIN 965 or DIN 7991, so all hex, cross, and torx versions of the screw of size M3x16mm should work.
-   5.5mm (M3) combination wrench
	- [Printable wrench](https://www.thingiverse.com/thing:2440589)
-   Computer with Pronterface or OctoPrint
	- [Pronterface](https://www.pronterface.com/)
	- [OctoPrint](https://octoprint.org/)
-   Micro USB cable
-   Torx wrench or driver (recommend wrench for precision)
-   Tube cutting jig
	- [STL](https://github.com/PaulGameDev/PrusaMK3_Silicone_Leveling)
-   Razorblade or sharp knife
-   (Optional): Bed Tightening Jig to assist with adjustments
	- [Dial+Pointer](https://www.printables.com/model/43629-prusa-mini-silicone-bed-leveling-mod-bed-tightenin)
	- Remixes are available for different tip types

## Installation/Setup Procedure

1.  Make sure your X-Z assembly is square with the Y assembly.
    If you find that adjustments are necessary, please follow the [official Prusa Mini/Mini+ article](https://help.prusa3d.com/en/article/xz-axis-skew-correction-mini_158518).

<a href="/images/XZ-axis_skew_correction.png"><img src="/images/XZ-axis_skew_correction.png" width="100%"></a>

2.  Power off the printer.

3.  Cut 8 pieces of silicone tubing using the jig linked above. Or if you have a steady hand, cut 8 x 10mm pieces without the jig.

<a href="/images/hi-temp-silicone.jpeg"><img src="/images/hi-temp-silicone.jpeg" width="49%"></a>
<a href="/images/hi-temp-silicone-cutting.jpeg"><img src="/images/hi-temp-silicone-cutting.jpeg" width="49%"></a>

4.  Remove printbed

5.  Remove heatbed. Follow the instructions as show in the [official Prusa Mini/Mini+ documentation](https://help.prusa3d.com/en/guide/how-to-replace-a-heatbed-mini_156765#156923).

<a href="/images/heatbed-mounting.png"><img src="/images/heatbed-removal.png" width="100%"></a>

6.  Remove the 8 3mm screws and spacers along the outside of the Y carriage (leave the center screw & spacer)

<a href="/images/y-carriage.jpeg"><img src="/images/y-carriage.jpeg" width="32%"></a>
<a href="/images/y-carraige-standoff.jpeg"><img src="/images/y-carraige-standoff.jpeg" width="32%"></a>
<a href="/images/standoffs.jpeg"><img src="/images/standoffs.jpeg" width="32%"></a>

7.  Replace the heatbed while placing the cut silicone tubing in place of the previous metal spacers (between the carriage and the bed). Place the 8 16mm Torx screws through the heatbed, silicone tube and carriage to hold it all together.

<a href="/images/007.jpeg"><img src="/images/007.jpeg" width="49%"></a>
<a href="/images/pmsblm-mid-assembly.jpeg"><img src="/images/pmsblm-mid-assembly.jpeg" width="49%"></a>

8.  Carefully apply pressure to a corner Torx screw to compress the silicone tube and loosely attach a low-profile 3mm nut. This step may not be that easy. The silicone tube is very hard to compress (we want that). Just be careful.

9.  Go to the opposite corner and do the same. Now the other two corners and then the remaining screws. Again, be very careful here, you can break the heatbed if it bends too much!

10.  Start tightening the screws back into place until approximately 6mm between the Y-carriage and the heatbed. The original spacer is 6mm, so using one you removed is a useful way to measure the gap. TIGHTEN SCREWS BY ONE TURN EACH! This takes a while but ensures you get it back on level and without unnecessarily stressing the bed. Follow the order as shown in the [official Prusa Mini/Mini+ documentation](https://help.prusa3d.com/en/guide/how-to-replace-a-heatbed-mini_156765#157010).

<a href="/images/heatbed-mounting.png"><img src="/images/heatbed-mounting.png" width="100%"></a>
<a href="/images/y-carraige-heatbed-6mm.jpeg"><img src="/images/y-carraige-heatbed-6mm.jpeg" width="50%"></a>

11.  Screw in the center screw until tight.

<a href="/images/heatbed-center-screw.jpeg"><img src="/images/heatbed-center-screw.jpeg" width="50%"></a>

## Leveling Procedure
1.  Power on the printer
2.  Plug in USB-B from computer to the printer
3.  Fire up Pronterface or OctoPrint and hit the connect to printer button
4.  In the bottom right text box or Terminal tab, enter the following GCode followed by the enter key.

	**Make sure you replace your steel sheet**

	```
    M104 S170 ; set extruder temp for bed leveling
    M140 S60 ; set bed temp
    M109 R170 ; wait for extruder to reach temp
    M190 S60 ; wait for bed temp
    ```

5.  Once the temperature has reached the target, input the GCode below.
    ```
    G28 ; home all without mesh bed level
    G29 ; mesh bed leveling
    G0 Z180 F720 ; raise Z
    ```

6.  Now, wait for the mesh leveling to complete.
	You should see output something like this:
	```
	0 -0.048 -0.040 -0.066 -0.035
	1 -0.040 -0.030 -0.044 -0.010
	2 -0.065 -0.050 -0.061 -0.047
	3 -0.347 -0.029 -0.045 -0.155
	```

7.  Copy the results and paste them into the text area on the Prusa Mini G29 converter page found here: [https://bbbenji.github.io/PMSBLM/](https://bbbenji.github.io/PMSBLM/).

    It has been reported in Windows that using Ctrl+C to copy the text output from Pronterface does not always work, this may cause you to paste in the previous values. Instead, select the text then right-click and click Copy.

8.  Follow the instructions for which screws to turn and how far. If using the 3D printed wrench, make sure you brace it against the nut before turning the screw as it has a small amount of play which may affect your accuracy. A metal wrench is the better option.
	- The bed tightening jig is useful here for judging degree rotations.

9.  Repeat steps 5-8 until the numbers from the results section on the website are no more than .02 difference between your biggest and smallest numbers. Ideally 0.

<a href="/images/before.png"><img src="/images/before.png" width="32%"></a>
<a href="/images/after.png"><img src="/images/after.png" width="32%"></a>
<a href="/images/after_values.png"><img src="/images/after_values.png" width="32%"></a>

**Remember to replace your steel sheet and let the bed reach temperature before starting step 5.**

10.  Run Z calibration again resetting the current value. You've just changed the height of your print surface and you don't want to crash the nozzle into it.

11.  Spend loads of quality time printing the bottom 2mm of Benchy and getting that live-z value perfect.

## Notes
-   Why Torx screws? Because the Mini's heatbed screw holes are not as deep as the Mk3's. Hex screws will sit proud of the bed. Update: Any DIN 965 or DIN 7991 M3x16 screws should work as they share the same dimensions.
-   Why low-profile locknuts? Actually the only area the low-profile locknut is required on is the top center mount point. This allows clearing the Y-axis motor mount.
-   If you cannot find low-profile locknuts, you can use regular ones, but you will need 18mm M3 Torx screws. However, the top center point REQUIRES a 16mm Torx screw and low-profile locknut. If you cannot find a single low-profile locknut, you can sand one down to approx 3mm height.

_I take no responsibility or liability, for any damages including, but not limited to indirect or consequential and/or loss of life._

## Credit
- Thanks to @Paul_GD for the original idea ([prusa3d Discord](https://discord.com/invite/ArjqkbG))
- Thanks to [@robee](https://forum.prusaprinters.org/forum/profile/robee/) for the detailed pictures
- Thanks to [@Glademist](https://github.com/Glademist) for suggested improvements to this guide.
